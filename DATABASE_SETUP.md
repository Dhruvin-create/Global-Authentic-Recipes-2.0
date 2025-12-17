# Database Setup Guide

## Prerequisites
- MySQL Server installed and running
- Node.js and npm installed

## Step 1: Configure Environment Variables

Edit `.env.local` in the project root and add your MySQL connection details:

```dotenv
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=recipes_db

# Hugging Face API for AI Image Generation (optional)
HUGGING_FACE_API_KEY=hf_your_token_here
```

## Step 2: Create the Database

Run one of the following methods:

### Option A: Using the Setup Script (Recommended)

```bash
node setup-db.js
```

This will automatically create the database and tables.

### Option B: Manual MySQL Command Line

1. Open MySQL command line or MySQL Workbench
2. Run the SQL commands in `database-schema.sql`

```bash
mysql -h localhost -u root -p < database-schema.sql
```

## Step 3: Verify the Setup

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000 in your browser

3. Try adding a recipe - it should now save to your MySQL database

## Database Schema

The application uses a single table: `recipes`

**Columns:**
- `id` (INT, Primary Key, Auto Increment)
- `title` (VARCHAR 255, Required)
- `ingredients` (TEXT, Required)
- `steps` (TEXT, Optional)
- `image` (VARCHAR 500, Optional)
- `cooking_time` (VARCHAR 50, Optional)
- `difficulty` (VARCHAR 50, Optional)
- `history` (TEXT, Optional)
- `platingStyle` (VARCHAR 255, Optional)
- `created_at` (TIMESTAMP, Auto set to current time)

## Troubleshooting

### Connection Refused
- Ensure MySQL is running: `mysql --version`
- Check your DB_HOST, DB_USER, DB_PASSWORD in `.env.local`
- Default MySQL port is 3306

### Database Already Exists
- The setup script will skip if database exists
- To reset: Drop the database manually and run the setup again

### Fallback Mode
- If database is unavailable, the app uses mock in-memory data
- Check browser console for warnings about database connectivity

## Next Steps

1. Configure optional Hugging Face API key for AI image generation
2. Customize the database schema if needed
3. Set up regular backups of your MySQL database
