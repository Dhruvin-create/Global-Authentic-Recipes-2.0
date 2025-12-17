# Global Authentic Recipes - Quick Start Guide

## 🚀 Getting Started with Database

### Step 1: Configure Database Credentials

Edit `.env.local` and update your MySQL credentials:

```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=recipes_db
```

### Step 2: Set Up the Database

Run the setup script:

```bash
node setup-db.js
```

This will:
- Create the `recipes_db` database
- Create the `recipes` table with all necessary columns
- Insert a sample recipe for testing

### Step 3: Start the Application

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## ✅ Testing the Database

1. **View Recipes**: Go to `/recipes` to see all recipes
2. **Add Recipe**: Click "Add Recipe" and fill in the form
3. **Upload Image**: Upload an image or use AI generation
4. **View Details**: Click on a recipe to see full details

## 📋 Project Structure

```
global-authentic-recipes/
├── pages/
│   ├── api/
│   │   └── recipes/
│   │       ├── index.js (GET/POST recipes)
│   │       ├── [id].js (GET/PUT/DELETE recipe)
│   │       └── generate-image.js (AI image generation)
│   ├── add-recipe.tsx (Add recipe page)
│   ├── recipes.tsx (View recipes page)
│   └── recipes/[id].tsx (Recipe details page)
├── src/
│   ├── lib/
│   │   └── db.js (MySQL connection pool)
│   ├── components/
│   │   └── layout.tsx (Layout wrapper)
│   └── styles/
│       └── globals.css (Global styles)
├── public/
│   └── uploads/ (Recipe images stored here)
├── .env.local (Database credentials)
├── database-schema.sql (SQL schema)
├── setup-db.js (Setup script)
└── package.json
```

## 🔧 Database Schema

The `recipes` table has these columns:

| Column | Type | Notes |
|--------|------|-------|
| id | INT | Primary key, auto-increment |
| title | VARCHAR(255) | Recipe title (required) |
| ingredients | LONGTEXT | Recipe ingredients (required) |
| steps | LONGTEXT | Cooking steps |
| image | VARCHAR(500) | Image URL or path |
| cooking_time | VARCHAR(50) | Time in minutes |
| difficulty | VARCHAR(50) | Easy, Medium, Hard |
| history | LONGTEXT | Recipe history/origin |
| platingStyle | VARCHAR(255) | Presentation style |
| created_at | TIMESTAMP | Auto-set creation time |
| updated_at | TIMESTAMP | Auto-update on changes |

## 🐛 Troubleshooting

### MySQL Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
- Start MySQL service: `mysql.server start` (macOS) or use Services (Windows)
- Verify MySQL is running: `mysql --version`
- Check credentials in `.env.local`

### Database Already Exists

The setup script will skip existing tables. To reset:

```bash
# Via MySQL CLI
mysql -u root -p
DROP DATABASE recipes_db;
EXIT;

# Then run setup again
node setup-db.js
```

### Permission Denied Error

```
Error: ER_ACCESS_DENIED_ERROR
```

**Solution:**
- Verify MySQL username and password in `.env.local`
- Make sure MySQL user has CREATE privileges
- Common default: user=`root`, password=empty

### App Works but Data Not Saving

The app has a fallback mode using mock data. Check:
1. Browser console for warnings
2. Database is running and accessible
3. Credentials in `.env.local` are correct
4. MySQL user has INSERT/UPDATE privileges

## 📚 API Endpoints

- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Add new recipe (with image upload)
- `GET /api/recipes/[id]` - Get recipe by ID
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe
- `POST /api/recipes/generate-image` - Generate AI image for recipe

## 🎨 Optional: AI Image Generation

To enable AI image generation for recipes:

1. Get a free API key from [Hugging Face](https://huggingface.co/settings/tokens)
2. Add to `.env.local`:
   ```
   HUGGING_FACE_API_KEY=hf_your_token_here
   ```
3. On the "Add Recipe" page, click "Generate Image with AI"

## 📦 Build for Production

```bash
npm run build
npm start
```

The app will be available at http://localhost:3000

## 🎯 Features Checklist

- [x] Add recipes with images
- [x] View all recipes
- [x] View recipe details
- [x] Edit recipes
- [x] Delete recipes
- [x] Upload recipe images
- [x] AI image generation (optional)
- [x] Responsive design
- [x] MySQL database integration

---

For more help, check `DATABASE_SETUP.md` or the source code comments.
