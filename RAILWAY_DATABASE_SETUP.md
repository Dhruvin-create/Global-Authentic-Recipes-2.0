# Railway Database Setup Guide - Global Authentic Recipes

## 🚂 Railway MySQL Database Configuration

Railway ek free MySQL database provide karta hai jo production-ready hai. Yeh guide aapko step-by-step setup karega.

---

## 📋 STEP 1: Railway Account Setup

### 1.1 Create Railway Account
1. Visit: https://railway.app/
2. Click "Login" ya "Start a New Project"
3. Sign up with GitHub account (recommended)
4. Verify your email address

### 1.2 Free Tier Details
- **Storage**: 1GB database storage
- **RAM**: 512MB
- **Bandwidth**: 100GB/month
- **Cost**: $5 free credit per month
- **Perfect for**: Development and small production apps

---

## 📋 STEP 2: Create MySQL Database

### 2.1 Create New Project
1. Railway dashboard pe jaayein
2. Click "New Project"
3. Select "Provision MySQL"
4. Database automatically create ho jayega

### 2.2 Get Database Credentials
1. MySQL service pe click karein
2. "Variables" tab pe jaayein
3. Yeh credentials dikhenge:

```
MYSQLHOST=containers-us-west-xxx.railway.app
MYSQLPORT=3306
MYSQLUSER=root
MYSQLDATABASE=railway
MYSQLPASSWORD=your-generated-password
DATABASE_URL=mysql://root:password@host:3306/railway
```

### 2.3 Note Important Details
```env
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-generated-password
DB_NAME=railway
DATABASE_URL=mysql://root:password@containers-us-west-xxx.railway.app:3306/railway
```

---

## 📋 STEP 3: Connect to Railway Database

### 3.1 Using MySQL Workbench (GUI)

1. **Download MySQL Workbench**: https://dev.mysql.com/downloads/workbench/
2. **Create New Connection**:
   - Connection Name: `Railway - Global Recipes`
   - Hostname: `containers-us-west-xxx.railway.app` (from Railway)
   - Port: `3306`
   - Username: `root`
   - Password: (click "Store in Keychain" and paste Railway password)
3. **Test Connection** → Click "OK"
4. **Connect** to database

### 3.2 Using Command Line

```bash
# Install MySQL client if not installed
# Windows: Download from MySQL website
# Mac: brew install mysql-client
# Linux: sudo apt-get install mysql-client

# Connect to Railway database
mysql -h containers-us-west-xxx.railway.app -P 3306 -u root -p railway
# Enter password when prompted
```

### 3.3 Using Node.js Script

Create `test-railway-connection.js`:

```javascript
import mysql from 'mysql2/promise';

const config = {
  host: 'containers-us-west-xxx.railway.app',
  port: 3306,
  user: 'root',
  password: 'your-railway-password',
  database: 'railway'
};

async function testConnection() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to Railway database!');
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

Run: `node test-railway-connection.js`

---

## 📋 STEP 4: Import Database Schema

### 4.1 Using MySQL Workbench

1. **Connect** to Railway database
2. **File** → **Run SQL Script**
3. Select `database/schema.sql`
4. Click **Run**
5. Wait for completion (creates all 15 tables)

### 4.2 Using Command Line

```bash
# Navigate to your project directory
cd C:\Users\admin\global-authentic-recipes

# Import schema
mysql -h containers-us-west-xxx.railway.app -P 3306 -u root -p railway < database/schema.sql

# Import seed data (optional)
mysql -h containers-us-west-xxx.railway.app -P 3306 -u root -p railway < database/seed.sql
```

### 4.3 Using Node.js Script

Update `insert-recipes-final.js` with Railway credentials:

```javascript
const dbConfig = {
  host: 'containers-us-west-xxx.railway.app',
  port: 3306,
  user: 'root',
  password: 'your-railway-password',
  database: 'railway'
};
```

Then run:
```bash
node insert-recipes-final.js
```

---

## 📋 STEP 5: Verify Database Setup

### 5.1 Check Tables Created

```sql
-- Show all tables
SHOW TABLES;

-- Should show 15 tables:
-- users, recipes, cuisines, ingredients, instructions
-- reviews, likes, favorites, recipe_stats, cuisine_stats
-- user_stats, notifications, user_sessions, password_resets, audit_logs
```

### 5.2 Check Sample Data

```sql
-- Check users
SELECT COUNT(*) as user_count FROM users;

-- Check recipes
SELECT COUNT(*) as recipe_count FROM recipes;

-- Check cuisines
SELECT * FROM cuisines;
```

### 5.3 Create Test User

```sql
-- Create super admin user
INSERT INTO users (
  id, username, first_name, last_name, email, 
  password, role, is_verified, created_at
) VALUES (
  UUID(),
  'admin',
  'Admin',
  'User',
  'admin@globalrecipes.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWeCrm4.', -- password: admin123
  'SUPER_ADMIN',
  TRUE,
  NOW()
);
```

---

## 📋 STEP 6: Update Environment Variables

### 6.1 Local Development (.env.local)

```env
# Railway Database
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-railway-password
DB_NAME=railway
DATABASE_URL=mysql://root:password@containers-us-west-xxx.railway.app:3306/railway

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Authentication
JWT_SECRET=your-32-character-secret-key-here
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-32-character-session-secret
```

### 6.2 Cloudflare Pages (Production)

Cloudflare deployment ke liye yeh environment variables set karein:

```env
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-railway-password
DB_NAME=railway
DATABASE_URL=mysql://root:password@containers-us-west-xxx.railway.app:3306/railway
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app.pages.dev
JWT_SECRET=your-production-secret-32-chars
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-production-session-secret
```

---

## 📋 STEP 7: Railway Database Management

### 7.1 View Database Metrics

1. Railway dashboard pe MySQL service select karein
2. **Metrics** tab pe jaayein
3. Dekh sakte hain:
   - CPU usage
   - Memory usage
   - Network traffic
   - Query performance

### 7.2 Database Backups

Railway automatic backups nahi karta free tier pe. Manual backup:

```bash
# Export entire database
mysqldump -h containers-us-west-xxx.railway.app -P 3306 -u root -p railway > backup.sql

# Import backup
mysql -h containers-us-west-xxx.railway.app -P 3306 -u root -p railway < backup.sql
```

### 7.3 Monitor Database Size

```sql
-- Check database size
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'railway'
GROUP BY table_schema;
```

---

## 🔒 STEP 8: Security Best Practices

### 8.1 Secure Your Credentials

1. **Never commit** Railway credentials to GitHub
2. **Use .env.local** for local development
3. **Use environment variables** in production
4. **Rotate passwords** regularly

### 8.2 Database Access Control

```sql
-- Create read-only user (optional)
CREATE USER 'readonly'@'%' IDENTIFIED BY 'strong-password';
GRANT SELECT ON railway.* TO 'readonly'@'%';
FLUSH PRIVILEGES;
```

### 8.3 Enable SSL Connection (Recommended)

Railway supports SSL by default. Update connection:

```javascript
const dbConfig = {
  host: 'containers-us-west-xxx.railway.app',
  port: 3306,
  user: 'root',
  password: 'your-password',
  database: 'railway',
  ssl: {
    rejectUnauthorized: true
  }
};
```

---

## 🚀 STEP 9: Test Production Connection

### 9.1 Update Local Environment

```bash
# Copy Railway credentials to .env.local
cp .env.example .env.local
# Edit .env.local with Railway credentials
```

### 9.2 Test Local Connection

```bash
# Start development server
npm run dev

# Visit test endpoint
# http://localhost:3000/api/test-db
```

### 9.3 Expected Response

```json
{
  "success": true,
  "message": "Database test completed",
  "data": {
    "connection": {
      "success": true,
      "message": "Database connected successfully"
    },
    "basicQuery": {
      "test": 1,
      "current_time": "2026-03-02T..."
    },
    "tables": {
      "recipes": { "count": 8 },
      "cuisines": { "count": 15 },
      "users": { "count": 1 }
    },
    "environment": {
      "DB_HOST": "Set",
      "DB_PORT": "Set",
      "DB_USER": "Set",
      "DB_PASSWORD": "Set",
      "DB_NAME": "Set",
      "NODE_ENV": "development"
    }
  }
}
```

---

## 📊 Railway vs Other Options

| Feature | Railway | PlanetScale | Vercel Postgres |
|---------|---------|-------------|-----------------|
| Free Tier | 1GB | 5GB | 256MB |
| Setup Time | 2 minutes | 5 minutes | 3 minutes |
| MySQL Support | ✅ Yes | ✅ Yes | ❌ PostgreSQL |
| Auto Backups | ❌ Paid | ✅ Free | ✅ Free |
| SSL Support | ✅ Yes | ✅ Yes | ✅ Yes |
| Best For | Quick Setup | Production | Vercel Apps |

**Recommendation**: Railway is perfect for your use case!

---

## 🔧 Troubleshooting

### Issue 1: Connection Timeout

**Solution**:
```javascript
const dbConfig = {
  // ... other config
  connectTimeout: 20000, // 20 seconds
  acquireTimeout: 20000
};
```

### Issue 2: Too Many Connections

**Solution**:
```javascript
const dbConfig = {
  // ... other config
  connectionLimit: 5, // Reduce for free tier
  waitForConnections: true,
  queueLimit: 0
};
```

### Issue 3: SSL Certificate Error

**Solution**:
```javascript
const dbConfig = {
  // ... other config
  ssl: {
    rejectUnauthorized: false // For development only
  }
};
```

---

## ✅ Railway Setup Checklist

- [ ] Railway account created
- [ ] MySQL database provisioned
- [ ] Database credentials copied
- [ ] MySQL Workbench connected (optional)
- [ ] Schema imported (`schema.sql`)
- [ ] Seed data imported (`seed.sql` or `insert-recipes-final.js`)
- [ ] Test user created
- [ ] Environment variables updated
- [ ] Local connection tested (`/api/test-db`)
- [ ] Recipes visible on website
- [ ] Ready for Cloudflare deployment

---

## 🎯 Next Steps

After Railway database setup:

1. ✅ **Database Ready** - Railway MySQL configured
2. 🔄 **Next**: Cloudflare Pages deployment
3. 🔄 **Then**: Connect Cloudflare to Railway database
4. 🔄 **Finally**: Test live website

**Railway database setup complete! Ready for Cloudflare deployment.** 🚀

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **MySQL Docs**: https://dev.mysql.com/doc/
- **Project Issues**: Check `/api/test-db` endpoint

---

**Last Updated**: March 2, 2026  
**Status**: Ready for production use with Railway database