-- ============================================
-- MIGRATION: Add Cuisines Table to Existing Database
-- Run these queries step by step in HeidiSQL/phpMyAdmin
-- ============================================

USE global_recipes;

-- ============================================
-- STEP 1: Create Cuisines Table
-- ============================================

CREATE TABLE cuisines (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) UNIQUE NOT NULL COMMENT 'e.g., Indian, Italian, Chinese',
    slug VARCHAR(100) UNIQUE NOT NULL COMMENT 'URL-friendly version',
    description TEXT COMMENT 'Brief description of the cuisine',
    image VARCHAR(500) COMMENT 'Cuisine representative image',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STEP 2: Insert Default Cuisines
-- ============================================

INSERT INTO cuisines (id, name, slug, description, image, is_active) VALUES
(UUID(), 'Indian', 'indian', 'Rich and diverse cuisine with aromatic spices and traditional cooking methods', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', TRUE),
(UUID(), 'Italian', 'italian', 'Mediterranean cuisine famous for pasta, pizza, and fresh ingredients', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400', TRUE),
(UUID(), 'Chinese', 'chinese', 'Ancient cuisine with diverse regional styles and cooking techniques', 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400', TRUE),
(UUID(), 'Mexican', 'mexican', 'Vibrant cuisine with bold flavors, spices, and traditional ingredients', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', TRUE),
(UUID(), 'Thai', 'thai', 'Southeast Asian cuisine known for balance of sweet, sour, salty, and spicy', 'https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400', TRUE),
(UUID(), 'Japanese', 'japanese', 'Traditional cuisine emphasizing fresh ingredients and artistic presentation', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', TRUE),
(UUID(), 'French', 'french', 'Classic European cuisine known for sophisticated techniques and flavors', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', TRUE),
(UUID(), 'Mediterranean', 'mediterranean', 'Healthy cuisine featuring olive oil, fresh vegetables, and seafood', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', TRUE),
(UUID(), 'American', 'american', 'Diverse cuisine reflecting multicultural influences and regional specialties', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', TRUE),
(UUID(), 'Korean', 'korean', 'Fermented foods, bold flavors, and healthy ingredients define this cuisine', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400', TRUE);

-- ============================================
-- STEP 3: Add cuisine_id Column to Recipes Table
-- ============================================

-- Add new column (nullable first)
ALTER TABLE recipes 
ADD COLUMN cuisine_id VARCHAR(36) NULL 
COMMENT 'Foreign key to cuisines table'
AFTER category;

-- Add index for performance
ALTER TABLE recipes 
ADD INDEX idx_cuisine_id (cuisine_id);

-- ============================================
-- STEP 4: Update Existing Recipes with Cuisine IDs
-- ============================================

-- Update recipes that have 'Indian' cuisine
UPDATE recipes r 
JOIN cuisines c ON c.name = 'Indian'
SET r.cuisine_id = c.id 
WHERE r.cuisine LIKE '%Indian%' OR r.cuisine LIKE '%indian%';

-- Update recipes that have 'Italian' cuisine
UPDATE recipes r 
JOIN cuisines c ON c.name = 'Italian'
SET r.cuisine_id = c.id 
WHERE r.cuisine LIKE '%Italian%' OR r.cuisine LIKE '%italian%';

-- Update recipes that have 'Chinese' cuisine
UPDATE recipes r 
JOIN cuisines c ON c.name = 'Chinese'
SET r.cuisine_id = c.id 
WHERE r.cuisine LIKE '%Chinese%' OR r.cuisine LIKE '%chinese%';

-- Update recipes that have 'Mexican' cuisine
UPDATE recipes r 
JOIN cuisines c ON c.name = 'Mexican'
SET r.cuisine_id = c.id 
WHERE r.cuisine LIKE '%Mexican%' OR r.cuisine LIKE '%mexican%';

-- Update recipes that have 'Thai' cuisine
UPDATE recipes r 
JOIN cuisines c ON c.name = 'Thai'
SET r.cuisine_id = c.id 
WHERE r.cuisine LIKE '%Thai%' OR r.cuisine LIKE '%thai%';

-- Update recipes that have 'Japanese' cuisine
UPDATE recipes r 
JOIN cuisines c ON c.name = 'Japanese'
SET r.cuisine_id = c.id 
WHERE r.cuisine LIKE '%Japanese%' OR r.cuisine LIKE '%japanese%';

-- Update recipes that have 'French' cuisine
UPDATE recipes r 
JOIN cuisines c ON c.name = 'French'
SET r.cuisine_id = c.id 
WHERE r.cuisine LIKE '%French%' OR r.cuisine LIKE '%french%';

-- Update recipes that have 'Mediterranean' cuisine
UPDATE recipes r 
JOIN cuisines c ON c.name = 'Mediterranean'
SET r.cuisine_id = c.id 
WHERE r.cuisine LIKE '%Mediterranean%' OR r.cuisine LIKE '%mediterranean%';

-- Update recipes that have 'American' cuisine
UPDATE recipes r 
JOIN cuisines c ON c.name = 'American'
SET r.cuisine_id = c.id 
WHERE r.cuisine LIKE '%American%' OR r.cuisine LIKE '%american%';

-- Update recipes that have 'Korean' cuisine
UPDATE recipes r 
JOIN cuisines c ON c.name = 'Korean'
SET r.cuisine_id = c.id 
WHERE r.cuisine LIKE '%Korean%' OR r.cuisine LIKE '%korean%';

-- ============================================
-- STEP 5: Handle Unmapped Cuisines
-- ============================================

-- Check if any recipes still have NULL cuisine_id
SELECT id, title, cuisine 
FROM recipes 
WHERE cuisine_id IS NULL;

-- For unmapped cuisines, create new cuisine entries or map to 'Other'
-- Add 'Other' cuisine for unmapped recipes
INSERT INTO cuisines (id, name, slug, description, is_active) VALUES
(UUID(), 'Other', 'other', 'Miscellaneous and fusion cuisines', TRUE);

-- Map remaining NULL recipes to 'Other'
UPDATE recipes r 
JOIN cuisines c ON c.name = 'Other'
SET r.cuisine_id = c.id 
WHERE r.cuisine_id IS NULL;

-- ============================================
-- STEP 6: Make cuisine_id Required and Add Foreign Key
-- ============================================

-- Make cuisine_id NOT NULL (after all recipes are mapped)
ALTER TABLE recipes 
MODIFY COLUMN cuisine_id VARCHAR(36) NOT NULL;

-- Add foreign key constraint
ALTER TABLE recipes 
ADD CONSTRAINT fk_recipes_cuisine 
FOREIGN KEY (cuisine_id) REFERENCES cuisines(id) ON DELETE RESTRICT;

-- ============================================
-- STEP 7: Remove Old cuisine Column (OPTIONAL - Keep for backup)
-- ============================================

-- UNCOMMENT THESE LINES ONLY AFTER VERIFYING EVERYTHING WORKS
-- Rename old column for backup
-- ALTER TABLE recipes CHANGE COLUMN cuisine cuisine_backup VARCHAR(100);

-- Or completely drop it (BE CAREFUL!)
-- ALTER TABLE recipes DROP COLUMN cuisine;

-- ============================================
-- STEP 8: Update/Create Views with Cuisine Support
-- ============================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS recipe_stats;
DROP VIEW IF EXISTS user_activity;

-- Recreate recipe_stats view with cuisine information
CREATE VIEW recipe_stats AS
SELECT 
    r.id,
    r.title,
    r.author_id,
    c.name as cuisine_name,
    c.slug as cuisine_slug,
    r.category,
    r.view_count,
    COUNT(DISTINCT l.id) as like_count,
    COUNT(DISTINCT f.id) as favorite_count,
    COUNT(DISTINCT rv.id) as review_count,
    COALESCE(AVG(rv.rating), 0) as avg_rating
FROM recipes r
LEFT JOIN cuisines c ON r.cuisine_id = c.id
LEFT JOIN likes l ON r.id = l.recipe_id
LEFT JOIN favorites f ON r.id = f.recipe_id
LEFT JOIN reviews rv ON r.id = rv.recipe_id
GROUP BY r.id, r.title, r.author_id, c.name, c.slug, r.category, r.view_count;

-- Recreate user_activity view
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

-- Create new cuisine_stats view
CREATE VIEW cuisine_stats AS
SELECT 
    c.id,
    c.name,
    c.slug,
    c.is_active,
    COUNT(DISTINCT r.id) as recipe_count,
    COUNT(DISTINCT l.id) as total_likes,
    COUNT(DISTINCT f.id) as total_favorites,
    COUNT(DISTINCT rv.id) as total_reviews,
    COALESCE(AVG(rv.rating), 0) as avg_rating
FROM cuisines c
LEFT JOIN recipes r ON c.id = r.cuisine_id AND r.is_published = TRUE
LEFT JOIN likes l ON r.id = l.recipe_id
LEFT JOIN favorites f ON r.id = f.recipe_id
LEFT JOIN reviews rv ON r.id = rv.recipe_id
GROUP BY c.id, c.name, c.slug, c.is_active
ORDER BY recipe_count DESC;

-- ============================================
-- STEP 9: Verification Queries
-- ============================================

-- Check cuisines created
SELECT 'Cuisines Created:' as Info;
SELECT id, name, slug, is_active FROM cuisines ORDER BY name;

-- Check recipes with cuisine mapping
SELECT 'Recipes with Cuisines:' as Info;
SELECT r.id, r.title, c.name as cuisine_name 
FROM recipes r 
JOIN cuisines c ON r.cuisine_id = c.id 
LIMIT 10;

-- Check cuisine statistics
SELECT 'Cuisine Statistics:' as Info;
SELECT name, recipe_count, total_likes, avg_rating 
FROM cuisine_stats 
WHERE recipe_count > 0;

-- Check for any unmapped recipes (should be 0)
SELECT 'Unmapped Recipes (should be 0):' as Info;
SELECT COUNT(*) as unmapped_count 
FROM recipes 
WHERE cuisine_id IS NULL;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================

SELECT '✅ MIGRATION COMPLETED SUCCESSFULLY!' as Status;
SELECT 'Your database now has proper cuisine management!' as Message;