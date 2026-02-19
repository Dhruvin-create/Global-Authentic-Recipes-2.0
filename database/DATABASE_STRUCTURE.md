# 📊 Database Structure - Global Authentic Recipes

## 🗄️ Complete Table Structure

### 1. **users** - User Authentication & Management
```sql
- id (UUID, Primary Key)
- email (Unique, nullable)
- phone (Unique, nullable) 
- password (Hashed)
- name, avatar, role (USER/ADMIN)
- auth_provider (EMAIL/PHONE)
- verification & reset tokens
- timestamps
```

### 2. **cuisines** - Cuisine Categories ⭐ NEW
```sql
- id (UUID, Primary Key)
- name (e.g., "Indian", "Italian")
- slug (URL-friendly)
- description, image
- is_active (boolean)
- timestamps
```

### 3. **recipes** - Recipe Management
```sql
- id (UUID, Primary Key)
- title, slug, description, image
- category (BREAKFAST, LUNCH, etc.)
- cuisine_id (Foreign Key → cuisines) ⭐ UPDATED
- difficulty (EASY/MEDIUM/HARD)
- prep_time, cook_time, servings, calories
- is_published, is_featured, view_count
- author_id (Foreign Key → users)
- timestamps
```

### 4. **recipe_images** - Additional Recipe Images
```sql
- id, recipe_id, image_url, display_order
```

### 5. **ingredients** - Recipe Ingredients
```sql
- id, recipe_id, name, quantity, display_order
```

### 6. **instructions** - Cooking Steps
```sql
- id, recipe_id, step_number, description, image
```

### 7. **reviews** - User Reviews & Ratings
```sql
- id, user_id, recipe_id, rating (1-5), comment
- is_approved, timestamps
```

### 8. **review_replies** - Admin Replies
```sql
- id, review_id, admin_id, comment, timestamps
```

### 9. **likes** - Recipe Likes
```sql
- id, user_id, recipe_id, created_at
```

### 10. **favorites** - Saved Recipes
```sql
- id, user_id, recipe_id, created_at
```

### 11. **playlists** - Custom Collections
```sql
- id, user_id, name, description, is_public
```

### 12. **playlist_items** - Recipes in Playlists
```sql
- id, playlist_id, recipe_id, display_order, added_at
```

### 13. **tags** - Recipe Tags
```sql
- id, name, slug
```

### 14. **recipe_tags** - Recipe-Tag Relationships
```sql
- recipe_id, tag_id (Composite Primary Key)
```

---

## 📈 Analytics Views

### 1. **recipe_stats** - Recipe Performance
```sql
SELECT id, title, cuisine_name, category, 
       like_count, favorite_count, review_count, avg_rating
FROM recipe_stats;
```

### 2. **user_activity** - User Engagement
```sql
SELECT name, role, recipes_created, reviews_written, 
       likes_given, favorites_count, playlists_count
FROM user_activity;
```

### 3. **cuisine_stats** - Cuisine Popularity ⭐ NEW
```sql
SELECT name, recipe_count, total_likes, 
       total_favorites, total_reviews, avg_rating
FROM cuisine_stats;
```

---

## 🔗 Key Relationships

### User → Recipes (1:Many)
- Admin users can create multiple recipes
- Each recipe belongs to one author

### Cuisine → Recipes (1:Many) ⭐ NEW
- Each cuisine can have multiple recipes
- Each recipe belongs to one cuisine
- Prevents deletion of cuisines with recipes (RESTRICT)

### Recipe → Components (1:Many)
- Each recipe has multiple ingredients
- Each recipe has multiple instructions
- Each recipe can have multiple additional images

### User ↔ Recipe Interactions (Many:Many)
- Users can like multiple recipes
- Users can favorite multiple recipes
- Users can review multiple recipes
- Users can create playlists with multiple recipes

---

## 🎯 Sample Queries

### Get Popular Cuisines
```sql
SELECT name, recipe_count, avg_rating 
FROM cuisine_stats 
WHERE recipe_count > 0 
ORDER BY recipe_count DESC, avg_rating DESC;
```

### Get Recipes by Cuisine
```sql
SELECT r.title, r.difficulty, r.prep_time, c.name as cuisine
FROM recipes r
JOIN cuisines c ON r.cuisine_id = c.id
WHERE c.slug = 'indian' AND r.is_published = TRUE
ORDER BY r.created_at DESC;
```

### Get User's Favorite Recipes with Cuisine
```sql
SELECT r.title, c.name as cuisine, f.created_at as favorited_at
FROM favorites f
JOIN recipes r ON f.recipe_id = r.id
JOIN cuisines c ON r.cuisine_id = c.id
WHERE f.user_id = 'user-uuid'
ORDER BY f.created_at DESC;
```

### Get Recipe with Full Details
```sql
SELECT 
    r.title, r.description, r.prep_time, r.cook_time,
    c.name as cuisine, r.difficulty, r.servings,
    u.name as author_name,
    rs.like_count, rs.favorite_count, rs.avg_rating
FROM recipes r
JOIN cuisines c ON r.cuisine_id = c.id
JOIN users u ON r.author_id = u.id
JOIN recipe_stats rs ON r.id = rs.id
WHERE r.slug = 'classic-butter-chicken';
```

---

## 🚀 Benefits of Cuisine Table

### ✅ **Normalization**
- No duplicate cuisine names
- Consistent cuisine data
- Easy to update cuisine information

### ✅ **Performance**
- Indexed cuisine lookups
- Efficient filtering by cuisine
- Better query optimization

### ✅ **Features**
- Cuisine-specific pages
- Cuisine statistics
- Cuisine management in admin panel
- Cuisine images and descriptions

### ✅ **Scalability**
- Easy to add new cuisines
- Can disable cuisines without deleting
- Support for cuisine hierarchies (future)

---

## 📝 Migration Notes

If updating existing database:
```sql
-- 1. Create cuisines table
CREATE TABLE cuisines (...);

-- 2. Insert default cuisines
INSERT INTO cuisines (...);

-- 3. Add cuisine_id column to recipes
ALTER TABLE recipes ADD COLUMN cuisine_id VARCHAR(36);

-- 4. Update existing recipes
UPDATE recipes r 
JOIN cuisines c ON r.cuisine = c.name 
SET r.cuisine_id = c.id;

-- 5. Drop old cuisine column
ALTER TABLE recipes DROP COLUMN cuisine;

-- 6. Add foreign key constraint
ALTER TABLE recipes ADD FOREIGN KEY (cuisine_id) REFERENCES cuisines(id);
```

---

**Database is now properly normalized with cuisine management! 🎉**