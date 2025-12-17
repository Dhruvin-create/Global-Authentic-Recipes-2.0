# Backend Server Setup

Your Express backend server is now configured and running on **port 5000**.

## Quick Start

### Option 1: Run Frontend Only (Next.js API Routes)
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Uses built-in Next.js API routes at `/pages/api/recipes/`

### Option 2: Run Backend Only
```bash
npm run backend
```
- Backend API: http://localhost:5000
- All recipe operations handled by Express server
- Database: MySQL (recipes_db)

### Option 3: Run Both (Recommended for Development)
**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run backend
```

Or use concurrently (if installed):
```bash
npm run dev:full
```

Then access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Backend Health: http://localhost:5000/health

## Backend API Endpoints

All endpoints are JSON-based. Base URL: `http://localhost:5000`

### Recipes
- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/:id` - Get recipe by ID
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### Health Check
- `GET /health` - Check if backend is running

## Environment Configuration

If you want to use the backend for API calls, update your frontend `.env.local`:

```dotenv
# Point frontend to backend server
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then in your components, import and use:
```typescript
import { apiClient } from '@/lib/api';

// Fetch recipes from backend
const recipes = await apiClient.getRecipes();
```

## Backend Architecture

- **Server**: Express.js running on port 5000
- **Database**: MySQL connection pool (10 connections)
- **Middleware**: CORS enabled, JSON parser
- **Error Handling**: Try-catch with proper HTTP status codes
- **Graceful Shutdown**: SIGINT handler for clean shutdown

## Database Connection

The backend uses the same MySQL credentials from `.env.local`:
- Host: `localhost`
- User: `root`
- Password: (blank)
- Database: `recipes_db`

## Testing the Backend

### Using cURL:
```bash
# Get all recipes
curl http://localhost:5000/api/recipes

# Create a recipe
curl -X POST http://localhost:5000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","ingredients":"Test ingredients"}'

# Get recipe by ID
curl http://localhost:5000/api/recipes/1

# Update recipe
curl -X PUT http://localhost:5000/api/recipes/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","ingredients":"New ingredients"}'

# Delete recipe
curl -X DELETE http://localhost:5000/api/recipes/1
```

### Using Postman:
1. Import the endpoints above
2. Set base URL to `http://localhost:5000`
3. Send requests with JSON body for POST/PUT

## Switching Between Frontend and Backend APIs

**Next.js API Routes** (default):
- Requests go to `/pages/api/recipes/`
- No external API needed
- Good for simple deployments

**Express Backend** (recommended for scalability):
- Set `NEXT_PUBLIC_API_URL=http://localhost:5000` in `.env.local`
- Requests go to `http://localhost:5000/api/recipes/`
- Separate backend server
- Better for microservices architecture

## Troubleshooting

### Backend won't start
```
Error: Cannot find module 'express'
```
Solution: `npm install express cors`

### MySQL connection error
```
Error: ER_ACCESS_DENIED_ERROR
```
Solution: Check `.env.local` has correct DB credentials

### CORS errors in frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
Solution: CORS is already enabled in backend. If using different domain, update `cors()` in `backend/server.js`

### Port already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```
Solution: Kill process on port 5000 or change port in environment:
```bash
BACKEND_PORT=5001 npm run backend
```

## Production Deployment

For production, you can:
1. Deploy Next.js frontend to Vercel
2. Deploy Express backend to Heroku, Railway, or similar
3. Update `NEXT_PUBLIC_API_URL` to point to production backend
4. Configure MySQL to use cloud database (AWS RDS, Google Cloud SQL, etc.)

---

Backend created and ready to use!
