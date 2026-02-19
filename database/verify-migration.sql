-- ============================================
-- VERIFICATION: Check Migration Success
-- Run this after migration to verify everything worked
-- ============================================

USE global_recipes;

-- ============================================
-- 1. Check if cuisines table exists and has data
-- ============================================
SELECT '=== CUISINES TABLE ===' as Section;
SELECT COUNT(*) as total_cuisines FROM cuisines;
SELECT name, slug, is_active FROM cuisines ORDER BY name;

-- ============================================
-- 2. Check if recipes table has cuisine_id column
-- ============================================
SELECT '=== RECIPES TABLE STRUCTURE ===' as Section;
DESCRIBE recipes;

-- ============================================
-- 3. Check if all recipes have cuisine_id mapped
-- ============================================
SELECT '=== RECIPE CUISINE MAPPING ===' as Section;
SELECT 
    COUNT(*) as total_recipes,
    COUNT(cuisine_id) as mapped_recipes,
    COUNT(*) - COUNT(cuisine_id) as unmapped_recipes
FROM recipes;

-- Show sample recipes with cuisine names
SELECT r.title, c.name as cuisine, r.category 
FROM recipes r 
LEFT JOIN cuisines c ON r.cuisine_id = c.id 
LIMIT 5;

-- ============================================
-- 4. Check foreign key constraint
-- ============================================
SELECT '=== FOREIGN KEY CONSTRAINTS ===' as Section;
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'global_recipes' 
AND TABLE_NAME = 'recipes' 
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ============================================
-- 5. Test cuisine statistics view
-- ============================================
SELECT '=== CUISINE STATISTICS ===' as Section;
SELECT * FROM cuisine_stats WHERE recipe_count > 0;

-- ============================================
-- 6. Test recipe statistics view with cuisine
-- ============================================
SELECT '=== RECIPE STATISTICS WITH CUISINE ===' as Section;
SELECT id, title, cuisine_name, like_count, favorite_count, avg_rating 
FROM recipe_stats 
LIMIT 5;

-- ============================================
-- 7. Check indexes
-- ============================================
SELECT '=== INDEXES ON RECIPES TABLE ===' as Section;
SHOW INDEX FROM recipes WHERE Column_name LIKE '%cuisine%';

-- ============================================
-- 8. Test sample queries
-- ============================================
SELECT '=== SAMPLE QUERIES TEST ===' as Section;

-- Get recipes by cuisine
SELECT 'Recipes by Indian cuisine:' as Query;
SELECT r.title, r.difficulty 
FROM recipes r 
JOIN cuisines c ON r.cuisine_id = c.id 
WHERE c.slug = 'indian' 
LIMIT 3;

-- Get popular cuisines
SELECT 'Popular cuisines:' as Query;
SELECT name, recipe_count 
FROM cuisine_stats 
WHERE recipe_count > 0 
ORDER BY recipe_count DESC 
LIMIT 3;

-- ============================================
-- MIGRATION VERIFICATION COMPLETE
-- ============================================

SELECT '✅ VERIFICATION COMPLETED!' as Status;
SELECT CASE 
    WHEN (SELECT COUNT(*) FROM recipes WHERE cuisine_id IS NULL) = 0 
    THEN '✅ All recipes have cuisine mapping'
    ELSE '❌ Some recipes missing cuisine mapping'
END as Recipe_Mapping_Status;

SELECT CASE 
    WHEN (SELECT COUNT(*) FROM cuisines) >= 10 
    THEN '✅ Cuisines table populated'
    ELSE '❌ Cuisines table needs data'
END as Cuisine_Data_Status;