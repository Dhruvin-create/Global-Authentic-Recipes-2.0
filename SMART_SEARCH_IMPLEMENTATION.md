# Smart Search System - Implementation Guide

## Overview

This guide details the complete implementation of a Smart Search System for Global Authentic Recipes with auto-find capabilities, authenticity tracking, and moderation workflows.

**Key Files Created:**
- SQL Migration: `migrations/001_add_ai_authenticity_fields.sql`
- Search API Route: `pages/api/recipes/search.ts`
- Worker: `src/lib/autoFindWorker.ts`
- Utilities: `src/lib/searchUtils.ts`, `src/lib/sourceFetcher.ts`, `src/lib/aiProvider.ts`
- Infrastructure: `src/lib/queue.ts`, `src/lib/cache.ts`, `src/lib/workerStart.ts`
- Config: `.env.example`

---

## Part 1: Database Setup

### Step 1: Run the Migration

Execute the migration to add new tables and columns:

```bash
# Connect to MySQL
mysql -h localhost -u root -p recipes_db < migrations/001_add_ai_authenticity_fields.sql
```

**New tables created:**
- `recipe_revisions`: Full audit trail of all changes
- `ai_source_snapshots`: Preserved snapshots of external sources (for provenance)
- `review_tasks`: Moderation workflow tracking
- `search_analytics`: Analytics on search patterns
- `ai_jobs_log`: Background job execution logs

**New recipe columns:**
- `canonical_name`: Normalized title for deduplication
- `name_fingerprint`: SHA256 hash for fast exact matching
- `ingredients_hash`: Hash of sorted ingredients for deduplication
- `authenticity_status`: ENUM ('verified', 'community', 'ai_pending', 'rejected')
- `ai_metadata`: JSON field with AI generation metadata
- `review_requested`: Flag for moderation queue

---

## Part 2: Environment Setup

### Step 2: Install Dependencies

Add required packages to `package.json`:

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "mysql2": "^3.6.0",
    "redis": "^4.6.0",
    "ioredis": "^5.3.0",
    "bull": "^4.11.0",
    "axios": "^1.6.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/bull": "^3.15.0"
  },
  "scripts": {
    "dev": "next dev",
    "worker": "ts-node src/lib/workerStart.ts",
    "build": "next build",
    "start": "next start"
  }
}
```

Install:

```bash
npm install bull ioredis axios openai
npm install --save-dev typescript @types/bull @types/node ts-node
```

### Step 3: Configure Environment

Copy the example config:

```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:
- Database: MySQL connection details
- Redis: Local or cloud Redis instance
- AI Provider: OpenAI API key (or Claude/Anthropic)
- External APIs: USDA, Wikipedia (optional)

---

## Part 3: Infrastructure Setup

### Step 4: Start Redis (if not running)

**On Windows (Laragon):**
- Redis is typically included. Start via Laragon control panel.

**Or use Docker:**

```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**Verify:**

```bash
redis-cli ping
# Output: PONG
```

### Step 5: Initialize Queues

The queue system (BullMQ + Redis) initializes automatically on first request. However, you can manually initialize:

```bash
node -e "const q = require('./src/lib/queue'); q.initializeQueues(); console.log('Queues ready');"
```

---

## Part 4: Running the System

### Step 6a: Start API Server (Main Process)

```bash
npm run dev
```

The Next.js server starts on `http://localhost:3000`.

**API Endpoint:**
- `GET /api/recipes/search?q=<query>&page=1&limit=20`

### Step 6b: Start Worker Process (Separate Terminal)

```bash
npx ts-node src/lib/workerStart.ts
```

Or in production, use PM2:

```bash
npm install -g pm2
pm2 start src/lib/workerStart.ts --name "recipe-worker"
pm2 logs recipe-worker
```

**Important:** The worker process must run separately to process background jobs.

---

## Part 5: API Usage

### Search Endpoint: GET /api/recipes/search

**Request:**

```bash
curl "http://localhost:3000/api/recipes/search?q=pad+thai&page=1&limit=20"
```

**Response (exact/fulltext match found):**

```json
{
  "success": true,
  "results": [
    {
      "id": 42,
      "title": "Pad Thai",
      "origin_country": "Thailand",
      "image": "https://...",
      "cooking_time": "30",
      "difficulty": "Medium",
      "authenticity_status": "verified",
      "relevance_score": 98.5,
      "match_type": "exact"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "auto_find_triggered": false
}
```

**Response (no match, auto-find triggered):**

```json
{
  "success": true,
  "results": [],
  "total": 0,
  "page": 1,
  "limit": 20,
  "auto_find_triggered": true,
  "job_id": "c4ef0a6a-8f9c-4d3a-9c8f-7e9c1a2b3c4d",
  "message": "No recipes found for \"rare regional dish\". Generating suggestions (AI-generated, pending review)..."
}
```

---

## Part 6: Monitoring Auto-Find Jobs

### Check Job Status

```bash
# In Redis CLI
HGETALL "bull:auto-find:c4ef0a6a-8f9c-4d3a-9c8f-7e9c1a2b3c4d"

# Or query database
SELECT * FROM ai_jobs_log WHERE job_id = 'c4ef0a6a-8f9c-4d3a-9c8f-7e9c1a2b3c4d';
```

### Query Pending AI Recipes

```sql
SELECT id, title, ai_metadata, review_requested 
FROM recipes 
WHERE authenticity_status = 'ai_pending' 
ORDER BY created_at DESC;
```

### View Source Snapshots

```sql
SELECT * FROM ai_source_snapshots 
WHERE recipe_id = 123;
```

---

## Part 7: Admin Review Workflow

### Admin Dashboard Endpoint (create manually)

Suggested route: `GET /api/admin/recipes/pending`

```typescript
// pages/api/admin/recipes/pending.ts
export default async function handler(req, res) {
  const recipes = await queryDb(`
    SELECT r.*, 
           COUNT(rt.id) as pending_reviews
    FROM recipes r
    LEFT JOIN review_tasks rt ON r.id = rt.recipe_id AND rt.status = 'pending'
    WHERE r.authenticity_status = 'ai_pending'
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `);

  return res.json({ recipes });
}
```

### Verify Recipe Endpoint (create manually)

Suggested route: `POST /api/admin/recipes/:id/verify`

```typescript
// pages/api/admin/recipes/[id]/verify.ts
export default async function handler(req, res) {
  const { id } = req.query;
  const { action, notes } = req.body; // action: 'verify' or 'reject'

  // Update recipe status
  await queryDb(`
    UPDATE recipes 
    SET authenticity_status = ?, 
        verified_at = NOW(),
        verified_by_user_id = ?
    WHERE id = ?
  `, [
    action === 'verify' ? 'verified' : 'rejected',
    req.user.id,
    id
  ]);

  // Create revision entry
  await queryDb(`
    INSERT INTO recipe_revisions (recipe_id, action, payload, actor_id, actor_role, reason_notes)
    VALUES (?, ?, ?, ?, 'admin', ?)
  `, [id, action === 'verify' ? 'verify' : 'reject', JSON.stringify({}), req.user.id, notes]);

  // Update review task
  await queryDb(`
    UPDATE review_tasks 
    SET status = ?, resolver_id = NOW()
    WHERE recipe_id = ? AND status = 'pending'
  `, [action === 'verify' ? 'approved' : 'rejected', id]);

  return res.json({ success: true });
}
```

---

## Part 8: Search Flow Diagram

```
User Query
    ↓
[GET /api/recipes/search?q=...]
    ↓
Normalize Query
    ├─ Lowercase, remove punct, strip diacritics
    ├─ Detect country/region
    └─ Detect ingredient tokens
    ↓
[Branch 1: Find Existing]
    ├─ Exact match (canonical_name)?
    │  └─ YES → Return results [cached 5min]
    ├─ FULLTEXT search?
    │  └─ YES → Rank & return [cached 10min]
    ├─ Fuzzy search (SOUNDEX)?
    │  └─ YES → Return results [cached 10min]
    └─ NO results?
       ↓
[Branch 2: Trigger Auto-Find]
    ├─ Check rate limits (5 req/day for IP, 50 for authenticated)
    ├─ Enqueue BullMQ job
    ├─ Return job_id (HTTP 202 Accepted)
    └─ Return placeholder UI message
    ↓
[Background Worker]
    ├─ Fetch from trusted sources
    ├─ Extract structured data
    ├─ Call AI model (OpenAI/Claude)
    ├─ Deduplicate against existing recipes
    ├─ Save as ai_pending
    ├─ Create review task
    └─ Log execution
    ↓
[UI polls for job completion]
    └─ When ready, show recipe with "Pending Review" badge
```

---

## Part 9: Database Query Examples

### Find Similar Recipes (Deduplication)

```sql
-- By name fingerprint (exact)
SELECT id, title FROM recipes 
WHERE name_fingerprint = UNHEX(SHA2('pad thai', 256));

-- By ingredients similarity (Jaccard)
SELECT r1.id, r2.id, 
       (SIZE(ingredients_set1 & ingredients_set2) / 
        SIZE(ingredients_set1 | ingredients_set2)) as similarity
FROM recipes r1, recipes r2
WHERE r1.id != r2.id 
  AND LEVENSHTEIN(r1.title, r2.title) <= 2;
```

### Search with Relevance Ranking

```sql
SELECT 
  id, title, authenticity_status, created_at,
  MATCH(title, ingredients, history) AGAINST('? IN NATURAL LANGUAGE MODE') as relevance
FROM recipes
WHERE MATCH(title, ingredients, history) AGAINST('? IN NATURAL LANGUAGE MODE')
ORDER BY 
  authenticity_status = 'verified' DESC,
  authenticity_status = 'community' DESC,
  relevance DESC,
  created_at DESC
LIMIT 20;
```

### Analytics: Top Searches

```sql
SELECT query_normalized, search_count, auto_find_triggered
FROM search_analytics
WHERE auto_find_triggered = TRUE
ORDER BY search_count DESC
LIMIT 20;
```

### Audit Trail for Recipe

```sql
SELECT * FROM recipe_revisions
WHERE recipe_id = 123
ORDER BY created_at DESC;
```

---

## Part 10: Error Handling & Troubleshooting

### Common Issues

**Issue: "Rate limit exceeded"**
- Check `RATE_LIMIT_AUTOFIND_DAILY` in `.env.local`
- Verify Redis connection: `redis-cli ping`
- Check rate limiter TTL: `redis-cli GET cache:ratelimit:autoFind:YOUR_IP`

**Issue: "No response from AI provider"**
- Verify API key: `echo $OPENAI_API_KEY`
- Check internet connection
- Verify OpenAI quota/billing
- Check job logs: `SELECT * FROM ai_jobs_log WHERE status = 'failed';`

**Issue: Worker not processing jobs**
- Verify worker is running: `ps aux | grep workerStart`
- Check Redis connection: `redis-cli info`
- Check job queue: `redis-cli LLEN bull:auto-find:_`
- View logs: `pm2 logs recipe-worker`

**Issue: Duplicate recipes being generated**
- Dedupe check failed; verify `calculateDedupeScore()` in `searchUtils.ts`
- Check if score threshold (0.75) is too low
- Review `ai_source_snapshots` for low-trust sources

---

## Part 11: Production Deployment

### Docker Compose Setup

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: recipes_db
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: .
    environment:
      DATABASE_URL: mysql://root:${DB_PASSWORD}@mysql:3306/recipes_db
      REDIS_HOST: redis
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - mysql
      - redis

  worker:
    build: .
    command: npm run worker
    environment:
      DATABASE_URL: mysql://root:${DB_PASSWORD}@mysql:3306/recipes_db
      REDIS_HOST: redis
      NODE_ENV: production
    depends_on:
      - mysql
      - redis

volumes:
  mysql_data:
```

### PM2 Ecosystem Config

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'recipe-api',
      script: 'npm',
      args: 'run start',
      instances: 2,
      exec_mode: 'cluster',
    },
    {
      name: 'recipe-worker',
      script: 'src/lib/workerStart.ts',
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
};
```

Start with:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Part 12: Performance Optimization

### Index Optimization

Verify indexes exist:
```sql
SHOW INDEX FROM recipes;
```

Key indexes should exist on:
- `authenticity_status`
- `origin_country`
- `name_fingerprint`
- `created_at`
- FULLTEXT on `(title, ingredients, history, platingStyle)`

### Query Performance Tuning

```sql
-- Analyze query plan
EXPLAIN SELECT * FROM recipes 
WHERE MATCH(title, ingredients) AGAINST('pasta' IN NATURAL LANGUAGE MODE)
ORDER BY created_at DESC
LIMIT 20;
```

### Caching Strategy

- Search results: 5-10 min TTL (high query volume)
- Recipe details: 30 min TTL (moderate changes)
- Verified recipes: 1 hour TTL (stable content)
- Invalidate on: recipe updates, verifications, rejections

### Rate Limiting Optimization

- Use Redis Lua scripts for atomic operations
- Consider distributed rate limiting for multi-server deployment
- Monitor: `redis-cli INFO stats`

---

## Part 13: Security Checklist

- [ ] API keys stored in environment variables (not in code)
- [ ] Database queries use parameterized statements (no SQL injection)
- [ ] CORS configured for allowed origins only
- [ ] Rate limiting enabled for all AI endpoints
- [ ] Content safety filtering implemented (see `aiProvider.ts`)
- [ ] Source URLs validated (no SSRF)
- [ ] Audit trail complete (recipe_revisions table)
- [ ] Admin endpoints require authentication
- [ ] HTTPS enforced in production
- [ ] Database backups configured
- [ ] Log rotation configured

---

## Next Steps

1. **Run migration** to set up database schema
2. **Install dependencies** (bull, redis, axios, openai)
3. **Configure environment** (.env.local)
4. **Start Redis** (local or Docker)
5. **Run API server** (`npm run dev`)
6. **Run worker** (`npx ts-node src/lib/workerStart.ts`)
7. **Test search** (`curl http://localhost:3000/api/recipes/search?q=pad+thai`)
8. **Monitor jobs** (Redis, database logs, worker logs)
9. **Create admin endpoints** for review workflow
10. **Deploy to production** (Docker, PM2, or your hosting)

---

For questions or issues, refer to the architecture documentation and code comments in each file.
