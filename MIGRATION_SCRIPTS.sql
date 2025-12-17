-- ============================================================================
-- IMPLEMENTATION & MIGRATION SCRIPTS
-- Global Authentic Recipes v2.0 Database Upgrade
-- ============================================================================
-- Use these scripts to gradually migrate from v1 to v2 with zero downtime
-- ============================================================================

USE recipes_db;

-- ============================================================================
-- PHASE 1: ALTER EXISTING RECIPES TABLE (Backward Compatible)
-- ============================================================================
-- No data loss - all new columns are optional with safe defaults
-- Existing queries continue to work

ALTER TABLE recipes ADD COLUMN (
  authenticity_status ENUM('verified', 'community', 'ai_generated', 'pending_review') 
    DEFAULT 'community' AFTER cooking_time,
  slug VARCHAR(255) UNIQUE AFTER id,
  short_description VARCHAR(500) AFTER slug,
  country_code CHAR(2) AFTER short_description,
  country_name VARCHAR(100) AFTER country_code,
  region VARCHAR(100) AFTER country_name,
  cuisine_type VARCHAR(100) AFTER region,
  festival_occasion VARCHAR(255) AFTER cuisine_type,
  season ENUM('spring', 'summer', 'autumn', 'winter', 'year_round') 
    DEFAULT 'year_round' AFTER festival_occasion,
  spice_level TINYINT(1) DEFAULT 0 AFTER season,
  prep_time_minutes INT AFTER spice_level,
  cook_time_minutes INT AFTER prep_time_minutes,
  servings INT DEFAULT 1 AFTER cook_time_minutes,
  status ENUM('published', 'draft', 'archived', 'flagged_review') 
    DEFAULT 'published' AFTER servings,
  is_deleted BOOLEAN DEFAULT FALSE AFTER status,
  deleted_at TIMESTAMP NULL AFTER is_deleted,
  version_number INT DEFAULT 1 AFTER deleted_at,
  parent_recipe_id INT AFTER version_number,
  view_count INT DEFAULT 0 AFTER parent_recipe_id,
  community_rating DECIMAL(3, 2) AFTER view_count,
  total_reviews INT DEFAULT 0 AFTER community_rating,
  authenticity_score DECIMAL(3, 2) DEFAULT 0.5 AFTER total_reviews,
  created_by_user_id INT AFTER authenticity_score,
  verified_by_user_id INT AFTER created_by_user_id,
  verified_at TIMESTAMP NULL AFTER verified_by_user_id,
  published_at TIMESTAMP NULL AFTER verified_at
);

-- Add indexes for new columns
CREATE INDEX idx_authenticity_status ON recipes(authenticity_status);
CREATE INDEX idx_country_cuisine ON recipes(country_code, cuisine_type);
CREATE INDEX idx_status_published ON recipes(status, published_at DESC);
CREATE INDEX idx_slug ON recipes(slug);
CREATE INDEX idx_soft_delete ON recipes(is_deleted, status);
CREATE INDEX idx_parent_recipe ON recipes(parent_recipe_id);
CREATE INDEX idx_created_by ON recipes(created_by_user_id);
CREATE FULLTEXT INDEX ft_recipe_search ON recipes(title, short_description, history);

-- Migration Script: Set slug for existing recipes
UPDATE recipes 
SET slug = LOWER(CONCAT(
  REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(title, ' ', '-'),
    'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'),
    'ä', 'a'), 'ë', 'e'), 'ï', 'i'), 'ö', 'o'), 'ü', 'u'),
    'à', 'a'), 'è', 'e'), 'ù', 'u'), 'ç', 'c'), '&', 'and'),
  '-', '-'),
  '-', id
))
WHERE slug IS NULL;

-- Migration Script: Calculate prep + cook time if available
UPDATE recipes
SET prep_time_minutes = 
  CAST(SUBSTRING_INDEX(cooking_time, '-', 1) AS UNSIGNED)
WHERE cooking_time LIKE '%-%' AND prep_time_minutes IS NULL;

UPDATE recipes
SET cook_time_minutes = 
  CAST(SUBSTRING_INDEX(cooking_time, '-', -1) AS UNSIGNED)
WHERE cooking_time LIKE '%-%' AND cook_time_minutes IS NULL;

UPDATE recipes
SET cook_time_minutes = CAST(cooking_time AS UNSIGNED)
WHERE cooking_time NOT LIKE '%-%' AND cook_time_minutes IS NULL;

-- Set published_at for existing recipes
UPDATE recipes
SET published_at = created_at
WHERE published_at IS NULL AND status = 'published';

-- ============================================================================
-- PHASE 2: CREATE USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  country_code CHAR(2),
  role ENUM('viewer', 'contributor', 'moderator', 'expert_curator', 'admin') DEFAULT 'viewer',
  reputation_score INT DEFAULT 0,
  is_verified_curator BOOLEAN DEFAULT FALSE,
  verification_badge VARCHAR(100),
  recipes_contributed INT DEFAULT 0,
  recipes_verified INT DEFAULT 0,
  total_reviews INT DEFAULT 0,
  helpful_votes INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_verified_curator (is_verified_curator),
  INDEX idx_reputation_score (reputation_score DESC),
  FULLTEXT INDEX ft_user_search (display_name, username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHASE 3: CREATE INGREDIENTS MASTER TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  primary_origin_country CHAR(2),
  primary_origin_region VARCHAR(100),
  common_substitutes JSON,
  cultural_variants JSON,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  is_nut_free BOOLEAN DEFAULT FALSE,
  allergen_info VARCHAR(500),
  storage_instructions VARCHAR(500),
  shelf_life_days INT,
  availability ENUM('year_round', 'seasonal', 'rare') DEFAULT 'year_round',
  peak_season VARCHAR(50),
  fair_trade_available BOOLEAN DEFAULT FALSE,
  organic_available BOOLEAN DEFAULT FALSE,
  source_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_slug (slug),
  INDEX idx_category (category, subcategory),
  INDEX idx_origin (primary_origin_country),
  INDEX idx_availability (availability)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed common ingredients (partial list - expand as needed)
INSERT INTO ingredients (name, slug, category, subcategory, is_vegan, is_vegetarian) VALUES
('Olive Oil', 'olive-oil', 'Oil', 'Cooking Oil', TRUE, TRUE),
('Parmesan Cheese', 'parmesan-cheese', 'Dairy', 'Cheese', FALSE, TRUE),
('Pasta', 'pasta', 'Grain', 'Noodles', TRUE, TRUE),
('Tomato', 'tomato', 'Vegetable', 'Fruit', TRUE, TRUE),
('Garlic', 'garlic', 'Vegetable', 'Bulb', TRUE, TRUE),
('Onion', 'onion', 'Vegetable', 'Bulb', TRUE, TRUE),
('Salt', 'salt', 'Seasoning', 'Salt', TRUE, TRUE),
('Black Pepper', 'black-pepper', 'Seasoning', 'Spice', TRUE, TRUE),
('Basil', 'basil', 'Herb', 'Fresh Herb', TRUE, TRUE),
('Eggs', 'eggs', 'Protein', 'Poultry', FALSE, TRUE);

-- ============================================================================
-- PHASE 4: CREATE RECIPE-INGREDIENT JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  display_text VARCHAR(255),
  preparation_notes VARCHAR(500),
  optional BOOLEAN DEFAULT FALSE,
  display_order INT NOT NULL,
  can_be_substituted BOOLEAN DEFAULT TRUE,
  suggested_substitutes TEXT,
  calories_per_serving DECIMAL(8, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recipe_ingredients_recipe FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_ingredients_ingredient FOREIGN KEY (ingredient_id) 
    REFERENCES ingredients(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_recipe_ingredient_order (recipe_id, display_order),
  INDEX idx_ingredient_id (ingredient_id),
  INDEX idx_recipe_id (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHASE 5: CREATE COOKING STEPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cooking_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  step_number INT NOT NULL,
  title VARCHAR(255),
  description LONGTEXT NOT NULL,
  estimated_duration_seconds INT,
  can_be_done_ahead BOOLEAN DEFAULT FALSE,
  prep_ahead_instructions VARCHAR(500),
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  alternative_methods JSON,
  required_equipment TEXT,
  equipment_alternatives TEXT,
  difficulty_level TINYINT(1) DEFAULT 2,
  common_mistakes VARCHAR(500),
  tips TEXT,
  warnings TEXT,
  ingredients_used JSON,
  display_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cooking_steps_recipe FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE KEY uk_recipe_step_number (recipe_id, step_number),
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_step_order (recipe_id, step_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHASE 6: CREATE RECIPE REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  user_id INT NOT NULL,
  rating_stars TINYINT(1) NOT NULL,
  taste_rating TINYINT(1),
  authenticity_rating TINYINT(1),
  difficulty_rating TINYINT(1),
  ease_to_follow TINYINT(1),
  title VARCHAR(255),
  review_text LONGTEXT,
  cultural_notes VARCHAR(500),
  regional_variation VARCHAR(255),
  family_connection VARCHAR(500),
  modifications_made VARCHAR(500),
  suggested_improvements VARCHAR(500),
  substitutions_used TEXT,
  has_photo BOOLEAN DEFAULT FALSE,
  photo_url VARCHAR(500),
  verified_purchase_or_cooked BOOLEAN DEFAULT FALSE,
  helpful_votes INT DEFAULT 0,
  unhelpful_votes INT DEFAULT 0,
  is_verified_by_team BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recipe_reviews_recipe FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_reviews_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_recipe_user_review (recipe_id, user_id),
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_user_id (user_id),
  INDEX idx_rating_stars (rating_stars DESC),
  INDEX idx_authenticity_rating (authenticity_rating DESC),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_helpful_votes (helpful_votes DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHASE 7: CREATE RECIPE VARIATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_variations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_recipe_id INT NOT NULL,
  variation_recipe_id INT NOT NULL,
  variation_type ENUM('regional', 'family', 'dietary_adaptation', 'modern_twist', 'historical') 
    DEFAULT 'regional',
  region_or_source VARCHAR(255) NOT NULL,
  description TEXT,
  ingredient_differences JSON,
  technique_differences VARCHAR(500),
  flavor_profile_change VARCHAR(255),
  source_cuisine VARCHAR(100),
  documented_since_year INT,
  created_by_user_id INT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by_user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_variations_original FOREIGN KEY (original_recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_variations_variation FOREIGN KEY (variation_recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_variations_creator FOREIGN KEY (created_by_user_id) 
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_variations_verifier FOREIGN KEY (verified_by_user_id) 
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_original_recipe (original_recipe_id),
  INDEX idx_variation_recipe (variation_recipe_id),
  INDEX idx_variation_type (variation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHASE 8: CREATE VERIFICATION HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_verification_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  action ENUM('submitted', 'under_review', 'approved', 'rejected', 'flagged', 'archived') NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  actor_user_id INT NOT NULL,
  actor_role VARCHAR(50),
  notes TEXT,
  required_changes VARCHAR(500),
  authenticity_feedback VARCHAR(500),
  suggested_improvements VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verification_recipe FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_verification_actor FOREIGN KEY (actor_user_id) 
    REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_action (action),
  INDEX idx_actor_user_id (actor_user_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHASE 9: CREATE CUISINES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cuisines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  region VARCHAR(100),
  country_codes JSON,
  description LONGTEXT,
  key_ingredients TEXT,
  cooking_methods TEXT,
  cultural_significance VARCHAR(500),
  image_url VARCHAR(500),
  parent_cuisine_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cuisine_parent FOREIGN KEY (parent_cuisine_id) 
    REFERENCES cuisines(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_region (region),
  INDEX idx_parent_cuisine (parent_cuisine_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed cuisines
INSERT INTO cuisines (name, slug, region) VALUES
('Italian', 'italian', 'Southern Europe'),
('French', 'french', 'Western Europe'),
('Chinese', 'chinese', 'East Asia'),
('Indian', 'indian', 'South Asia'),
('Mexican', 'mexican', 'North America'),
('Spanish', 'spanish', 'Southern Europe'),
('Thai', 'thai', 'Southeast Asia'),
('Japanese', 'japanese', 'East Asia'),
('Mediterranean', 'mediterranean', 'Southern Europe'),
('Middle Eastern', 'middle-eastern', 'Western Asia');

-- ============================================================================
-- PHASE 10: CREATE RECIPE_CUISINES JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_cuisines (
  recipe_id INT NOT NULL,
  cuisine_id INT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_recipe_cuisine_recipe FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_cuisine_cuisine FOREIGN KEY (cuisine_id) 
    REFERENCES cuisines(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, cuisine_id),
  INDEX idx_cuisine_id (cuisine_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHASE 11: CREATE FESTIVALS_OCCASIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS festivals_occasions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  cultural_background VARCHAR(500),
  date_month TINYINT,
  date_day TINYINT,
  duration_days INT,
  is_lunar BOOLEAN DEFAULT FALSE,
  primary_countries JSON,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_date (date_month, date_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed festivals
INSERT INTO festivals_occasions (name, slug, date_month, date_day, is_lunar) VALUES
('Christmas', 'christmas', 12, 25, FALSE),
('Thanksgiving', 'thanksgiving', 11, 0, FALSE),
('Easter', 'easter', 4, 0, TRUE),
('Diwali', 'diwali', 11, 0, TRUE),
('Lunar New Year', 'lunar-new-year', 2, 0, TRUE),
('Hanukkah', 'hanukkah', 12, 0, TRUE),
('Eid al-Fitr', 'eid-al-fitr', 5, 0, TRUE),
('Thanksgiving', 'thanksgiving', 11, 0, FALSE);

-- ============================================================================
-- PHASE 12: CREATE RECIPE_FESTIVALS JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_festivals (
  recipe_id INT NOT NULL,
  festival_id INT NOT NULL,
  significance VARCHAR(500),
  CONSTRAINT fk_recipe_festival_recipe FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_festival_festival FOREIGN KEY (festival_id) 
    REFERENCES festivals_occasions(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, festival_id),
  INDEX idx_festival_id (festival_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHASE 13: CREATE GEOGRAPHIC_COORDINATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS geographic_coordinates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country_code CHAR(2) UNIQUE NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  region_name VARCHAR(100),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  primary_cuisine_ids JSON,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_country_code (country_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed geographic data (sample)
INSERT INTO geographic_coordinates (country_code, country_name, latitude, longitude) VALUES
('IT', 'Italy', 41.8719, 12.5674),
('FR', 'France', 46.2276, 2.2137),
('ES', 'Spain', 40.4637, -3.7492),
('JP', 'Japan', 36.2048, 138.2529),
('IN', 'India', 20.5937, 78.9629),
('MX', 'Mexico', 23.6345, -102.5528),
('TH', 'Thailand', 15.8700, 100.9925),
('CN', 'China', 35.8617, 104.1954),
('US', 'United States', 37.0902, -95.7129),
('SA', 'Saudi Arabia', 23.8859, 45.0792);

-- ============================================================================
-- PHASE 14: CREATE RECIPE_TAGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag_name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(500),
  category VARCHAR(50),
  recipe_count INT DEFAULT 0,
  usage_frequency INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_usage_frequency (usage_frequency DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed common tags
INSERT INTO recipe_tags (tag_name, slug, category) VALUES
('Quick', 'quick', 'time'),
('One-Pot', 'one-pot', 'technique'),
('No-Bake', 'no-bake', 'technique'),
('Vegan', 'vegan', 'dietary'),
('Vegetarian', 'vegetarian', 'dietary'),
('Gluten-Free', 'gluten-free', 'dietary'),
('Dairy-Free', 'dairy-free', 'dietary'),
('Budget-Friendly', 'budget-friendly', 'occasion'),
('Comfort Food', 'comfort-food', 'occasion'),
('Date Night', 'date-night', 'occasion'),
('Family Favorite', 'family-favorite', 'occasion'),
('Weeknight', 'weeknight', 'time'),
('Weekend Project', 'weekend-project', 'time');

-- ============================================================================
-- PHASE 15: CREATE RECIPE_TAGS JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_tags_relation (
  recipe_id INT NOT NULL,
  tag_id INT NOT NULL,
  added_by_user_id INT,
  CONSTRAINT fk_recipe_tag_recipe FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_tag_tag FOREIGN KEY (tag_id) 
    REFERENCES recipe_tags(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_tag_user FOREIGN KEY (added_by_user_id) 
    REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (recipe_id, tag_id),
  INDEX idx_tag_id (tag_id),
  INDEX idx_added_by (added_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHASE 16: CREATE RECIPE_CHANGELOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_changelog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  change_type ENUM('created', 'updated', 'verified', 'translated', 'image_updated', 'metadata_updated') NOT NULL,
  changed_fields JSON,
  changed_by_user_id INT,
  change_reason VARCHAR(500),
  previous_version_snapshot JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_changelog_recipe FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_changelog_user FOREIGN KEY (changed_by_user_id) 
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_change_type (change_type),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- ============================================================================

-- Check that all tables exist
SELECT TABLE_NAME FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'recipes_db' 
ORDER BY TABLE_NAME;

-- Verify table row counts
SELECT 
  'recipes' as table_name, COUNT(*) as row_count FROM recipes
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'ingredients', COUNT(*) FROM ingredients
UNION ALL
SELECT 'recipe_ingredients', COUNT(*) FROM recipe_ingredients
UNION ALL
SELECT 'cooking_steps', COUNT(*) FROM cooking_steps
UNION ALL
SELECT 'recipe_reviews', COUNT(*) FROM recipe_reviews
UNION ALL
SELECT 'cuisines', COUNT(*) FROM cuisines
UNION ALL
SELECT 'festivals_occasions', COUNT(*) FROM festivals_occasions;

-- Check indexes
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'recipes_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ============================================================================
-- ROLLBACK PROCEDURE (if needed during testing)
-- ============================================================================
-- WARNING: This will delete all new tables. Use only in development!
/*
DROP TABLE IF EXISTS recipe_changelog;
DROP TABLE IF EXISTS recipe_tags_relation;
DROP TABLE IF EXISTS recipe_tags;
DROP TABLE IF EXISTS geographic_coordinates;
DROP TABLE IF EXISTS recipe_festivals;
DROP TABLE IF EXISTS festivals_occasions;
DROP TABLE IF EXISTS recipe_cuisines;
DROP TABLE IF EXISTS cuisines;
DROP TABLE IF EXISTS recipe_verification_history;
DROP TABLE IF EXISTS recipe_variations;
DROP TABLE IF EXISTS recipe_reviews;
DROP TABLE IF EXISTS cooking_steps;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS users;

ALTER TABLE recipes DROP COLUMN IF EXISTS authenticity_status;
ALTER TABLE recipes DROP COLUMN IF EXISTS slug;
-- ... etc for all new columns
*/

-- ============================================================================
-- NOTES ON MIGRATION STRATEGY
-- ============================================================================
-- 1. Execute phases sequentially in a development environment first
-- 2. Test each phase with sample queries before proceeding
-- 3. For production deployment, use database migrations tool
-- 4. Keep transaction logs during migration for rollback capability
-- 5. Schedule migration during low-traffic window
-- 6. Backup database before each phase
-- 7. Monitor query performance after each phase
-- 8. Update ORM models after database changes
-- 9. Test backward compatibility with existing API
-- 10. Deploy frontend changes after database is stable
-- ============================================================================
