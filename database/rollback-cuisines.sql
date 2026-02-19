-- ============================================
-- ROLLBACK: Remove Cuisines Table Changes
-- Use this ONLY if migration fails and you need to revert
-- ============================================

USE global_recipes;

-- ============================================
-- WARNING: This will remove all cuisine-related changes
-- Make sure you have a backup before running this!
-- ============================================

-- Step 1: Drop views that depend on cuisines
DROP VIEW IF EXISTS cuisine_stats;
DROP VIEW IF EXISTS recipe_stats;
DROP VIEW IF EXISTS user_activity;

-- Step 2: Remove foreign key constraint
ALTER TABLE recipes DROP FOREIGN KEY IF EXISTS fk_recipes_cuisine;

-- Step 3: Remove cuisine_id column from recipes
ALTER TABLE recipes DROP COLUMN IF EXISTS cuisine_id;

-- Step 4: Drop cuisines table
DROP TABLE IF EXISTS cuisines;

-- Step 5: Recreate original views (without cuisine support)
CREATE VIEW recipe_stats AS
SELECT 
    r.id,
    r.title,
    r.author_id,
    r.view_count,
    COUNT(DISTINCT l.id) as like_count,
    COUNT(DISTINCT f.id) as favorite_count,
    COUNT(DISTINCT rv.id) as review_count,
    COALESCE(AVG(rv.rating), 0) as avg_rating
FROM recipes r
LEFT JOIN likes l ON r.id = l.recipe_id
LEFT JOIN favorites f ON r.id = f.recipe_id
LEFT JOIN reviews rv ON r.id = rv.recipe_id
GROUP BY r.id, r.title, r.author_id, r.view_count;

CREATE VIEW user_activity AS
SELECT 
    u.id,
    u.name,
    u.role,
    COUNT(DISTINCT r.id) as recipes_created,
    COUNT(DISTINCT rv.id) as reviews_written,
    COUNT(DISTINCT l.id) as likes_given,
    COUNT(DISTINCT f.id) as favorites_count,
    COUNT(DISTINCT p.id) as playlists_count
FROM users u
LEFT JOIN recipes r ON u.id = r.author_id
LEFT JOIN reviews rv ON u.id = rv.user_id
LEFT JOIN likes l ON u.id = l.user_id
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN playlists p ON u.id = p.user_id
GROUP BY u.id, u.name, u.role;

SELECT '⚠️ ROLLBACK COMPLETED!' as Status;
SELECT 'Database reverted to original state without cuisines table' as Message;
SELECT 'Your original cuisine column in recipes table should still be intact' as Note;