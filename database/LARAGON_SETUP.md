# 🚀 Laragon MySQL Database Setup Guide

## Prerequisites
- ✅ Laragon installed and running
- ✅ MySQL service started in Laragon
- ✅ HeidiSQL or phpMyAdmin available

---

## 📋 Step-by-Step Setup

### Step 1: Start Laragon Services
1. Open **Laragon**
2. Click **Start All** button
3. Verify MySQL is running (green indicator)

### Step 2: Open Database Manager

#### Option A: Using HeidiSQL (Recommended)
1. In Laragon, click **Database** → **HeidiSQL**
2. Connection should open automatically
3. Default credentials:
   - **Host**: `localhost` or `127.0.0.1`
   - **User**: `root`
   - **Password**: (empty)
   - **Port**: `3306`

#### Option B: Using phpMyAdmin
1. In Laragon, click **Menu** → **www** → **phpMyAdmin**
2. Login with:
   - **Username**: `root`
   - **Password**: (empty)

### Step 3: Create Database

#### Using HeidiSQL:
1. Click **File** → **Run SQL file**
2. Select `database/schema.sql`
3. Click **Execute**
4. Wait for completion message

#### Using phpMyAdmin:
1. Click **Import** tab
2. Choose file: `database/schema.sql`
3. Click **Go**

#### Using Command Line:
```bash
# Open Laragon Terminal
cd C:\laragon\www\global-authentic-recipes

# Login to MySQL
mysql -u root -p

# Run schema
source database/schema.sql
```

### Step 4: Seed Sample Data
```sql
-- In HeidiSQL or phpMyAdmin, run:
source database/seed.sql

-- OR import seed.sql file same way as schema
```

### Step 5: Verify Database

```sql
-- Check database exists
SHOW DATABASES LIKE 'global_recipes';

-- Use database
USE global_recipes;

-- Check tables
SHOW TABLES;

-- Verify users
SELECT id, email, phone, name, role FROM users;

-- Verify recipes
SELECT id, title, category, cuisine FROM recipes;
```

---

## 🔐 Default Login Credentials

### Admin User
- **Email**: `admin@recipes.com`
- **Password**: `password123`
- **Role**: ADMIN
- **Can**: Create/Edit/Delete recipes, Reply to reviews, Manage users

### Normal User (Email)
- **Email**: `user@example.com`
- **Password**: `password123`
- **Role**: USER
- **Can**: View recipes, Like, Review, Create playlists

### Normal User (Phone)
- **Phone**: `+919876543210`
- **Password**: `password123`
- **Role**: USER
- **Can**: View recipes, Like, Review, Create playlists

---

## 📊 Database Structure

### Core Tables:
1. **users** - User authentication & profiles
2. **recipes** - Recipe main data
3. **ingredients** - Recipe ingredients
4. **instructions** - Step-by-step cooking instructions
5. **reviews** - User reviews & ratings
6. **review_replies** - Admin replies to reviews
7. **likes** - Recipe likes
8. **favorites** - Saved recipes
9. **playlists** - Custom recipe collections
10. **playlist_items** - Recipes in playlists
11. **tags** - Recipe tags
12. **recipe_tags** - Recipe-tag relationships

### Views (Analytics):
- **recipe_stats** - Recipe statistics (likes, favorites, ratings)
- **user_activity** - User activity summary

---

## 🔧 Environment Configuration

Create `.env.local` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=global_recipes

# Connection URL (for libraries that need it)
DATABASE_URL=mysql://root@localhost:3306/global_recipes

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🧪 Test Database Connection

Create `database/test-connection.js`:

```javascript
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'global_recipes'
    });
    
    console.log('✅ Database connected successfully!');
    
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Found ${users[0].count} users`);
    
    const [recipes] = await connection.execute('SELECT COUNT(*) as count FROM recipes');
    console.log(`✅ Found ${recipes[0].count} recipes`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
```

Run test:
```bash
npm install mysql2
node database/test-connection.js
```

---

## 🗑️ Reset Database (if needed)

```sql
-- Drop database
DROP DATABASE IF EXISTS global_recipes;

-- Recreate from scratch
source database/schema.sql
source database/seed.sql
```

---

## 📝 Common Issues & Solutions

### Issue 1: "Access denied for user 'root'"
**Solution**: Check Laragon MySQL password
```sql
-- In Laragon terminal
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
```

### Issue 2: "Database already exists"
**Solution**: Drop and recreate
```sql
DROP DATABASE global_recipes;
source database/schema.sql;
```

### Issue 3: "Table doesn't exist"
**Solution**: Run schema.sql again
```sql
USE global_recipes;
source database/schema.sql;
```

### Issue 4: Port 3306 already in use
**Solution**: 
1. Stop other MySQL services
2. Or change port in Laragon settings
3. Update `.env.local` with new port

---

## 🎯 Next Steps

1. ✅ Database created and seeded
2. ⏭️ Install Node.js dependencies
3. ⏭️ Create API routes for authentication
4. ⏭️ Build frontend components
5. ⏭️ Implement admin panel

---

## 📞 Support

If you face any issues:
1. Check Laragon logs: `C:\laragon\data\mysql\error.log`
2. Verify MySQL is running in Laragon
3. Test connection with HeidiSQL
4. Check firewall settings for port 3306

---

**Database is ready! 🎉**
