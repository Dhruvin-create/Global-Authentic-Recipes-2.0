-- ============================================================================
-- GLOBAL AUTHENTIC RECIPES - ENHANCED DATABASE SCHEMA v2.0
-- ============================================================================
-- Production-ready schema supporting:
-- - Authenticity verification & community trust
-- - Cultural storytelling & historical context
-- - Advanced search & AI recipe discovery
-- - Scalability & SEO optimization
-- - Community contributions & moderation
-- ============================================================================

USE recipes_db;

-- ============================================================================
-- 1. IMPROVED RECIPES TABLE (with backward compatibility)
-- ============================================================================
-- WHY: Enhanced to track authenticity, cultural metadata, SEO, and status
-- FEATURES: Verification workflows, regional variations, soft deletion, versioning

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS (
  -- Authenticity & Trust System
  authenticity_status ENUM('verified', 'community', 'ai_generated', 'pending_review') 
    DEFAULT 'community' 
    COMMENT 'Tracks source credibility: verified by experts, community-submitted, AI-generated, or pending',
  
  -- SEO & Discoverability
  slug VARCHAR(255) UNIQUE 
    COMMENT 'URL-friendly identifier for SEO (e.g., "classic-pasta-carbonara")',
  short_description VARCHAR(500) 
    COMMENT 'Brief recipe summary for search results and meta tags (max 160 chars)',
  
  -- Cultural & Regional Metadata
  country_code CHAR(2) 
    COMMENT 'ISO 3166-1 alpha-2 country code (e.g., "IT" for Italy)',
  country_name VARCHAR(100) 
    COMMENT 'Full country name for UX and SEO',
  region VARCHAR(100) 
    COMMENT 'Region/state/province (e.g., "Lazio" for Rome)',
  cuisine_type VARCHAR(100) 
    COMMENT 'Cuisine classification (e.g., "Italian", "Mediterranean")',
  
  -- Occasion & Seasonality
  festival_occasion VARCHAR(255) 
    COMMENT 'Associated festival/holiday (e.g., "Christmas", "Eid", "Hanukkah")',
  season ENUM('spring', 'summer', 'autumn', 'winter', 'year_round') 
    DEFAULT 'year_round' 
    COMMENT 'Best season to cook this recipe',
  
  -- Refined Difficulty & Time Metrics
  spice_level TINYINT(1) CHECK (spice_level >= 0 AND spice_level <= 5) 
    DEFAULT 0 
    COMMENT 'Spice heat level (0=none, 5=very hot)',
  prep_time_minutes INT 
    COMMENT 'Preparation time in minutes (before cooking)',
  cook_time_minutes INT 
    COMMENT 'Active cooking time in minutes',
  total_time_minutes INT GENERATED ALWAYS AS (COALESCE(prep_time_minutes, 0) + COALESCE(cook_time_minutes, 0)) STORED 
    COMMENT 'Automatically calculated total time',
  servings INT DEFAULT 1 
    COMMENT 'Number of servings this recipe makes',
  
  -- Content Management & Moderation
  status ENUM('published', 'draft', 'archived', 'flagged_review') 
    DEFAULT 'published' 
    COMMENT 'Publication status for editorial workflow',
  is_deleted BOOLEAN DEFAULT FALSE 
    COMMENT 'Soft delete flag (keeps historical data)',
  deleted_at TIMESTAMP NULL 
    COMMENT 'Timestamp of soft deletion for audit trail',
  
  -- Versioning & Change Tracking
  version_number INT DEFAULT 1 
    COMMENT 'Recipe version for tracking changes/updates',
  parent_recipe_id INT 
    COMMENT 'FK to original recipe if this is a regional variation',
  
  -- Analytics & Quality Metrics
  view_count INT DEFAULT 0 
    COMMENT 'Track popularity and engagement',
  community_rating DECIMAL(3, 2) CHECK (community_rating >= 0 AND community_rating <= 5) 
    COMMENT 'Average rating from community (0-5 stars)',
  total_reviews INT DEFAULT 0 
    COMMENT 'Number of reviews received',
  authenticity_score DECIMAL(3, 2) CHECK (authenticity_score >= 0 AND authenticity_score <= 1) 
    DEFAULT 0.5 
    COMMENT 'ML-calculated authenticity confidence (0-1)',
  
  -- Admin Fields
  created_by_user_id INT 
    COMMENT 'FK to users table - who submitted this recipe',
  verified_by_user_id INT 
    COMMENT 'FK to users table - who verified/approved this recipe',
  verified_at TIMESTAMP NULL 
    COMMENT 'When this recipe was verified as authentic',
  
  -- Enhanced Timestamps
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL 
    COMMENT 'When recipe was first published'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add/Update Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_authenticity_status ON recipes(authenticity_status);
CREATE INDEX IF NOT EXISTS idx_country_cuisine ON recipes(country_code, cuisine_type);
CREATE INDEX IF NOT EXISTS idx_status_published ON recipes(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_slug ON recipes(slug);
CREATE INDEX IF NOT EXISTS idx_soft_delete ON recipes(is_deleted, status);
CREATE INDEX IF NOT EXISTS idx_parent_recipe ON recipes(parent_recipe_id);
CREATE INDEX IF NOT EXISTS idx_created_by ON recipes(created_by_user_id);
CREATE FULLTEXT INDEX IF NOT EXISTS ft_recipe_search ON recipes(title, short_description, history);

-- ============================================================================
-- 2. USERS TABLE (Community Trust & Contributions)
-- ============================================================================
-- WHY: Track recipe contributors, enable reputation system, and support verification workflows
-- FEATURES: User roles, reputation scoring, verification badges, contribution history

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Auth & Identity
  username VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique username for display',
  email VARCHAR(255) UNIQUE NOT NULL COMMENT 'User email for notifications and recovery',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password for authentication',
  
  -- Profile
  display_name VARCHAR(100) NOT NULL COMMENT 'Public display name',
  bio TEXT COMMENT 'User bio/about section',
  avatar_url VARCHAR(500) COMMENT 'Profile picture URL',
  country_code CHAR(2) COMMENT 'User location (ISO 3166-1)',
  
  -- Roles & Permissions
  role ENUM('viewer', 'contributor', 'moderator', 'expert_curator', 'admin') 
    DEFAULT 'viewer' 
    COMMENT 'User role determines permissions and verification authority',
  
  -- Reputation & Trust System
  reputation_score INT DEFAULT 0 
    COMMENT 'Community reputation based on recipe quality, reviews, and verification',
  is_verified_curator BOOLEAN DEFAULT FALSE 
    COMMENT 'Expert/authentic cuisine expert - can verify recipes',
  verification_badge VARCHAR(100) COMMENT 'Badge title (e.g., "Italian Cooking Expert", "Michelin Chef")',
  
  -- Statistics
  recipes_contributed INT DEFAULT 0 COMMENT 'Total recipes submitted by user',
  recipes_verified INT DEFAULT 0 COMMENT 'Total recipes verified by this curator',
  total_reviews INT DEFAULT 0 COMMENT 'Community reviews written',
  helpful_votes INT DEFAULT 0 COMMENT 'Times user\'s reviews were marked helpful',
  
  -- Content Management
  is_active BOOLEAN DEFAULT TRUE COMMENT 'User account status',
  is_suspended BOOLEAN DEFAULT FALSE COMMENT 'Moderation flag for spam/abuse',
  suspension_reason VARCHAR(500) COMMENT 'Reason for account suspension',
  
  -- Timestamps
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
-- 3. INGREDIENTS TABLE (Ingredient Master Data)
-- ============================================================================
-- WHY: Normalize ingredients for better search, substitution, and nutritional tracking
-- FEATURES: Ingredient sourcing, substitutions, nutritional data, cultural alternatives

CREATE TABLE IF NOT EXISTS ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Basic Info
  name VARCHAR(255) UNIQUE NOT NULL COMMENT 'Canonical ingredient name (e.g., "Parmesan Cheese")',
  slug VARCHAR(255) UNIQUE NOT NULL COMMENT 'URL-friendly identifier for SEO',
  description TEXT COMMENT 'Ingredient description and characteristics',
  
  -- Categorization
  category VARCHAR(100) NOT NULL COMMENT 'Category: protein, vegetable, spice, dairy, grain, oil, etc.',
  subcategory VARCHAR(100) COMMENT 'Sub-category for filtering (e.g., "Cheese" subcategory of "Dairy")',
  
  -- Origin & Sourcing
  primary_origin_country CHAR(2) COMMENT 'ISO country code for primary sourcing region',
  primary_origin_region VARCHAR(100) COMMENT 'Region of origin (e.g., "Emilia-Romagna" for Parmesan)',
  
  -- Substitutions & Alternatives
  common_substitutes TEXT COMMENT 'JSON array of ingredient IDs that can substitute this ingredient',
  cultural_variants TEXT COMMENT 'JSON array of regional alternatives (e.g., Pecorino for Parmesan)',
  
  -- Properties
  is_vegan BOOLEAN DEFAULT FALSE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  is_nut_free BOOLEAN DEFAULT FALSE,
  allergen_info VARCHAR(500) COMMENT 'Comma-separated allergens: peanuts, tree nuts, sesame, etc.',
  
  -- Storage & Handling
  storage_instructions VARCHAR(500) COMMENT 'How to store this ingredient optimally',
  shelf_life_days INT COMMENT 'Average shelf life in days',
  
  -- Seasonality
  availability ENUM('year_round', 'seasonal', 'rare') DEFAULT 'year_round',
  peak_season VARCHAR(50) COMMENT 'Best season to source (e.g., "summer" or "May-August")',
  
  -- Sourcing & Ethics
  fair_trade_available BOOLEAN DEFAULT FALSE,
  organic_available BOOLEAN DEFAULT FALSE,
  source_notes TEXT COMMENT 'Notes on sourcing recommendations',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_slug (slug),
  INDEX idx_category (category, subcategory),
  INDEX idx_origin (primary_origin_country),
  INDEX idx_availability (availability)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. RECIPE_INGREDIENTS TABLE (Many-to-Many with Quantity)
-- ============================================================================
-- WHY: Link recipes to ingredients with exact quantities, units, and preparation notes
-- FEATURES: Flexible ingredient quantities, substitution suggestions, nutritional info

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Foreign Keys
  recipe_id INT NOT NULL COMMENT 'FK to recipes table',
  ingredient_id INT NOT NULL COMMENT 'FK to ingredients table',
  
  -- Quantity & Measurement
  quantity DECIMAL(10, 3) NOT NULL COMMENT 'Amount needed (e.g., 2.5)',
  unit VARCHAR(50) NOT NULL COMMENT 'Unit of measurement (g, ml, cup, tbsp, pinch, whole, etc.)',
  display_text VARCHAR(255) COMMENT 'Display text as shown in recipe (e.g., "2 1/2 cups flour")',
  
  -- Preparation
  preparation_notes VARCHAR(500) COMMENT 'How to prepare (chopped, minced, grated, sliced, etc.)',
  optional BOOLEAN DEFAULT FALSE COMMENT 'Is this ingredient optional?',
  
  -- Ordering & Organization
  display_order INT NOT NULL COMMENT 'Order in ingredient list',
  
  -- Substitution Support
  can_be_substituted BOOLEAN DEFAULT TRUE COMMENT 'Can this ingredient be substituted?',
  suggested_substitutes TEXT COMMENT 'Comma-separated list of alternative ingredient names',
  
  -- Nutritional Data (cached from ingredient_nutrition)
  calories_per_serving DECIMAL(8, 2) COMMENT 'Approximate calories per serving',
  
  -- Timestamps
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
-- 5. COOKING_STEPS TABLE (Detailed Instructions with Media)
-- ============================================================================
-- WHY: Replace simple text steps with rich, structured instructions
-- FEATURES: Step timing, images, videos, equipment tracking, difficulty per step

CREATE TABLE IF NOT EXISTS cooking_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Foreign Key
  recipe_id INT NOT NULL COMMENT 'FK to recipes table',
  
  -- Step Content
  step_number INT NOT NULL COMMENT 'Sequence order (1, 2, 3, ...)',
  title VARCHAR(255) COMMENT 'Step title (e.g., "Prepare the Dough")',
  description LONGTEXT NOT NULL COMMENT 'Detailed step instructions',
  
  -- Timing
  estimated_duration_seconds INT COMMENT 'How long this step typically takes (in seconds)',
  can_be_done_ahead BOOLEAN DEFAULT FALSE COMMENT 'Can this step be prepared in advance?',
  prep_ahead_instructions VARCHAR(500) COMMENT 'How to prep ahead if applicable',
  
  -- Media & References
  image_url VARCHAR(500) COMMENT 'Step-specific instructional image',
  video_url VARCHAR(500) COMMENT 'Optional video tutorial for this step',
  alternative_methods TEXT COMMENT 'Alternative techniques for this step (JSON)',
  
  -- Equipment & Tools
  required_equipment TEXT COMMENT 'Comma-separated list of equipment needed (e.g., "whisk, bowl, stovetop")',
  equipment_alternatives TEXT COMMENT 'Alternative equipment if preferred item unavailable',
  
  -- Difficulty & Warnings
  difficulty_level TINYINT(1) CHECK (difficulty_level >= 1 AND difficulty_level <= 5) 
    DEFAULT 2 COMMENT 'Difficulty of just this step (1=very easy, 5=very hard)',
  common_mistakes VARCHAR(500) COMMENT 'What typically goes wrong at this step',
  tips TEXT COMMENT 'Pro tips for success',
  warnings TEXT COMMENT 'Safety or technique warnings',
  
  -- Ingredient References (which ingredients are used in this step)
  ingredients_used TEXT COMMENT 'JSON array of ingredient IDs used in this specific step',
  
  -- Ordering
  display_order INT NOT NULL COMMENT 'Display position in recipe',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_cooking_steps_recipe FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  
  UNIQUE KEY uk_recipe_step_number (recipe_id, step_number),
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_step_order (recipe_id, step_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. RECIPE_REVIEWS TABLE (Community Feedback with Cultural Notes)
-- ============================================================================
-- WHY: Enable community validation, cultural insights, and trust building
-- FEATURES: Star ratings, cultural authenticity feedback, modification suggestions

CREATE TABLE IF NOT EXISTS recipe_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Foreign Keys
  recipe_id INT NOT NULL COMMENT 'FK to recipes table',
  user_id INT NOT NULL COMMENT 'FK to users table (reviewer)',
  
  -- Rating & Feedback
  rating_stars TINYINT(1) CHECK (rating_stars >= 1 AND rating_stars <= 5) 
    NOT NULL COMMENT 'Overall rating (1-5 stars)',
  
  -- Detailed Breakdown
  taste_rating TINYINT(1) CHECK (taste_rating >= 1 AND taste_rating <= 5) COMMENT 'Flavor/taste rating',
  authenticity_rating TINYINT(1) CHECK (authenticity_rating >= 1 AND authenticity_rating <= 5) 
    COMMENT 'How authentic to original culture/region?',
  difficulty_rating TINYINT(1) CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5) 
    COMMENT 'Actual difficulty level experienced',
  ease_to_follow TINYINT(1) CHECK (ease_to_follow >= 1 AND ease_to_follow <= 5) 
    COMMENT 'How clear/easy were the instructions?',
  
  -- Content
  title VARCHAR(255) COMMENT 'Review headline',
  review_text LONGTEXT COMMENT 'Detailed review',
  
  -- Cultural & Context Notes
  cultural_notes VARCHAR(500) COMMENT 'Reviewer\'s cultural insights or background with this recipe',
  regional_variation VARCHAR(255) COMMENT 'If reviewer knows regional variations: what\'s different here?',
  family_connection VARCHAR(500) COMMENT 'Personal/family connection to this recipe (optional)',
  
  -- Modifications & Suggestions
  modifications_made VARCHAR(500) COMMENT 'What did reviewer change/adapt?',
  suggested_improvements VARCHAR(500) COMMENT 'Suggestions for recipe improvement',
  substitutions_used TEXT COMMENT 'Which ingredient substitutions were used?',
  
  -- Verification
  has_photo BOOLEAN DEFAULT FALSE COMMENT 'Did reviewer include a photo of their result?',
  photo_url VARCHAR(500) COMMENT 'URL to reviewer\'s photo of cooked dish',
  verified_purchase_or_cooked BOOLEAN DEFAULT FALSE COMMENT 'Verified that reviewer actually cooked this',
  
  -- Community Engagement
  helpful_votes INT DEFAULT 0 COMMENT 'How many found this review helpful',
  unhelpful_votes INT DEFAULT 0 COMMENT 'How many found this review unhelpful',
  
  -- Moderation
  is_verified_by_team BOOLEAN DEFAULT FALSE COMMENT 'Team verified authenticity of this review',
  is_flagged BOOLEAN DEFAULT FALSE COMMENT 'Community flagged as spam/inappropriate',
  
  -- Timestamps
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
-- 7. RECIPE_VARIATIONS TABLE (Regional Adaptations)
-- ============================================================================
-- WHY: Track regional/family variations while maintaining recipe lineage
-- FEATURES: Recipe versioning, regional cooking methods, family recipes

CREATE TABLE IF NOT EXISTS recipe_variations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Relationship
  original_recipe_id INT NOT NULL COMMENT 'FK to parent/original recipes table',
  variation_recipe_id INT NOT NULL COMMENT 'FK to the variation stored in recipes table',
  
  -- Variation Context
  variation_type ENUM('regional', 'family', 'dietary_adaptation', 'modern_twist', 'historical') 
    DEFAULT 'regional' 
    COMMENT 'Type of variation',
  
  -- Description
  region_or_source VARCHAR(255) NOT NULL COMMENT 'Region or family name (e.g., "Sicilian variation", "Grandma Maria\'s version")',
  description TEXT COMMENT 'What makes this variation unique?',
  
  -- Key Differences
  ingredient_differences TEXT COMMENT 'Which ingredients differ (JSON of changes)',
  technique_differences VARCHAR(500) COMMENT 'Different cooking techniques used',
  flavor_profile_change VARCHAR(255) COMMENT 'How does it taste different? (e.g., "spicier", "sweeter")',
  
  -- Origin & Credibility
  source_cuisine VARCHAR(100) COMMENT 'e.g., "Sicilian", "Turkish", "American"',
  documented_since_year INT COMMENT 'Earliest documented year of this variation',
  
  -- Creation Metadata
  created_by_user_id INT COMMENT 'FK to users - who documented this variation',
  verified BOOLEAN DEFAULT FALSE COMMENT 'Verified as authentic regional variation',
  verified_by_user_id INT COMMENT 'FK to users - expert who verified this',
  
  -- Timestamps
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
-- 8. RECIPE_VERIFICATION_HISTORY TABLE (Audit Trail)
-- ============================================================================
-- WHY: Track verification workflow and maintain audit trail for authenticity
-- FEATURES: Verification workflow, approval history, expert feedback

CREATE TABLE IF NOT EXISTS recipe_verification_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Recipe Reference
  recipe_id INT NOT NULL COMMENT 'FK to recipes table',
  
  -- Action & Status
  action ENUM('submitted', 'under_review', 'approved', 'rejected', 'flagged', 'archived') 
    NOT NULL COMMENT 'Action taken on the recipe',
  previous_status VARCHAR(50) COMMENT 'Previous status before this action',
  new_status VARCHAR(50) COMMENT 'New status after this action',
  
  -- Actor Information
  actor_user_id INT NOT NULL COMMENT 'FK to users - who performed this action',
  actor_role VARCHAR(50) COMMENT 'Role of actor at time of action (for audit trail)',
  
  -- Notes & Feedback
  notes TEXT COMMENT 'Reason for action, feedback, or comments',
  required_changes VARCHAR(500) COMMENT 'If rejected, what needs to be fixed?',
  
  -- Authenticity Assessment
  authenticity_feedback VARCHAR(500) COMMENT 'Expert feedback on recipe authenticity',
  suggested_improvements VARCHAR(500) COMMENT 'Suggestions for enhancement',
  
  -- Timestamps
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
-- 9. CUISINES TABLE (Cuisine Master Data for Filtering)
-- ============================================================================
-- WHY: Standardize cuisine classifications and enable advanced filtering
-- FEATURES: Cuisine hierarchies, cultural context, cuisine maps

CREATE TABLE IF NOT EXISTS cuisines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Identity
  name VARCHAR(100) UNIQUE NOT NULL COMMENT 'Cuisine name (e.g., "Italian", "Thai", "French")',
  slug VARCHAR(100) UNIQUE NOT NULL COMMENT 'URL-friendly identifier',
  
  -- Classification
  region VARCHAR(100) COMMENT 'Geographic region (e.g., "Southern Europe")',
  country_codes JSON COMMENT 'JSON array of countries where this cuisine is predominant',
  
  -- Description & Context
  description LONGTEXT COMMENT 'History and characteristics of cuisine',
  key_ingredients TEXT COMMENT 'Comma-separated staple ingredients',
  cooking_methods TEXT COMMENT 'Common cooking techniques',
  cultural_significance VARCHAR(500) COMMENT 'Cultural importance and traditions',
  
  -- Media
  image_url VARCHAR(500) COMMENT 'Representative image of cuisine',
  
  -- Hierarchy
  parent_cuisine_id INT COMMENT 'FK to parent cuisine (e.g., Southern Italian is child of Italian)',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_cuisine_parent FOREIGN KEY (parent_cuisine_id) 
    REFERENCES cuisines(id) ON DELETE SET NULL,
  
  INDEX idx_slug (slug),
  INDEX idx_region (region),
  INDEX idx_parent_cuisine (parent_cuisine_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. RECIPE_CUISINES TABLE (Many-to-Many)
-- ============================================================================
-- WHY: Recipes can belong to multiple cuisine types for better categorization
-- FEATURES: Cross-cuisine search, multi-regional recipes

CREATE TABLE IF NOT EXISTS recipe_cuisines (
  recipe_id INT NOT NULL COMMENT 'FK to recipes',
  cuisine_id INT NOT NULL COMMENT 'FK to cuisines',
  is_primary BOOLEAN DEFAULT FALSE COMMENT 'Is this the primary cuisine for the recipe?',
  
  CONSTRAINT fk_recipe_cuisine_recipe FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_cuisine_cuisine FOREIGN KEY (cuisine_id) 
    REFERENCES cuisines(id) ON DELETE CASCADE,
  
  PRIMARY KEY (recipe_id, cuisine_id),
  INDEX idx_cuisine_id (cuisine_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. FESTIVALS_OCCASIONS TABLE (Cultural Events)
-- ============================================================================
-- WHY: Enable seasonal/occasion-based filtering and cultural storytelling
-- FEATURES: Festival browsing, seasonal recipes, cultural context

CREATE TABLE IF NOT EXISTS festivals_occasions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Identity
  name VARCHAR(150) UNIQUE NOT NULL COMMENT 'Festival/occasion name (e.g., "Christmas", "Diwali")',
  slug VARCHAR(150) UNIQUE NOT NULL COMMENT 'URL-friendly slug',
  
  -- Context
  description TEXT COMMENT 'History and significance of festival/occasion',
  cultural_background VARCHAR(500) COMMENT 'Cultural/religious background',
  
  -- Timing
  date_month TINYINT COMMENT 'Month (1-12), NULL if date varies',
  date_day TINYINT COMMENT 'Day of month, NULL if date varies',
  duration_days INT COMMENT 'How many days does celebration span?',
  is_lunar BOOLEAN DEFAULT FALSE COMMENT 'Based on lunar calendar?',
  
  -- Coverage
  primary_countries JSON COMMENT 'JSON array of country codes where celebrated',
  
  -- Media
  image_url VARCHAR(500),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_date (date_month, date_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. RECIPE_FESTIVALS TABLE (Many-to-Many)
-- ============================================================================
-- WHY: Connect recipes to festivals for seasonal/occasion-based discovery
-- FEATURES: Festival-based browsing, seasonal recommendations

CREATE TABLE IF NOT EXISTS recipe_festivals (
  recipe_id INT NOT NULL COMMENT 'FK to recipes',
  festival_id INT NOT NULL COMMENT 'FK to festivals_occasions',
  significance VARCHAR(500) COMMENT 'Why is this recipe special for this festival?',
  
  CONSTRAINT fk_recipe_festival_recipe FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_festival_festival FOREIGN KEY (festival_id) 
    REFERENCES festivals_occasions(id) ON DELETE CASCADE,
  
  PRIMARY KEY (recipe_id, festival_id),
  INDEX idx_festival_id (festival_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. RECIPE_CHANGELOG TABLE (Revision History)
-- ============================================================================
-- WHY: Track all changes to recipes for transparency, SEO, and AI training
-- FEATURES: Version history, change attribution, content recovery

CREATE TABLE IF NOT EXISTS recipe_changelog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Recipe Reference
  recipe_id INT NOT NULL COMMENT 'FK to recipes table',
  
  -- Change Metadata
  change_type ENUM('created', 'updated', 'verified', 'translated', 'image_updated', 'metadata_updated') 
    NOT NULL COMMENT 'Type of change made',
  changed_fields JSON COMMENT 'JSON object of {field: {old_value, new_value}}',
  
  -- Actor Information
  changed_by_user_id INT COMMENT 'FK to users - who made this change',
  change_reason VARCHAR(500) COMMENT 'Why was this change made?',
  
  -- Previous Values (snapshot)
  previous_version_snapshot JSON COMMENT 'JSON snapshot of recipe data before change',
  
  -- Timestamps
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
-- 14. GEOGRAPHIC_COORDINATES TABLE (Map-Based Browsing)
-- ============================================================================
-- WHY: Enable map-based recipe discovery by cuisine region
-- FEATURES: Map visualization, regional browsing, location-based recommendations

CREATE TABLE IF NOT EXISTS geographic_coordinates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Location Identity
  country_code CHAR(2) UNIQUE NOT NULL COMMENT 'ISO 3166-1 alpha-2 code',
  country_name VARCHAR(100) NOT NULL,
  region_name VARCHAR(100) COMMENT 'Region/state/province (if applicable)',
  
  -- Coordinates
  latitude DECIMAL(10, 8) NOT NULL COMMENT 'Geographic latitude',
  longitude DECIMAL(11, 8) NOT NULL COMMENT 'Geographic longitude',
  
  -- Region Details
  description TEXT COMMENT 'Geographic and cultural description',
  primary_cuisine_ids JSON COMMENT 'JSON array of primary cuisine IDs for this region',
  
  -- Media
  image_url VARCHAR(500) COMMENT 'Representative region image',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_country_code (country_code),
  SPATIAL INDEX sp_coordinates (POINT(latitude, longitude))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 15. RECIPE_TAGS TABLE (Flexible Tagging System)
-- ============================================================================
-- WHY: Enable flexible, user-driven categorization and discovery
-- FEATURES: Custom tags, trending topics, search optimization

CREATE TABLE IF NOT EXISTS recipe_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Tag Identity
  tag_name VARCHAR(100) UNIQUE NOT NULL COMMENT 'Tag name (e.g., "no-bake", "quick-weeknight")',
  slug VARCHAR(100) UNIQUE NOT NULL COMMENT 'URL-friendly slug',
  
  -- Metadata
  description VARCHAR(500) COMMENT 'What does this tag mean?',
  category VARCHAR(50) COMMENT 'Tag category (e.g., "technique", "dietary", "time", "occasion")',
  
  -- Usage Statistics
  recipe_count INT DEFAULT 0 COMMENT 'How many recipes have this tag',
  usage_frequency INT DEFAULT 0 COMMENT 'Popularity metric for sorting',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_usage_frequency (usage_frequency DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 16. RECIPE_TAGS_RELATION TABLE (Many-to-Many)
-- ============================================================================
-- WHY: Connect recipes to flexible tags for enhanced discoverability
-- FEATURES: Multi-tag filtering, smart recommendations

CREATE TABLE IF NOT EXISTS recipe_tags_relation (
  recipe_id INT NOT NULL COMMENT 'FK to recipes',
  tag_id INT NOT NULL COMMENT 'FK to recipe_tags',
  added_by_user_id INT COMMENT 'FK to users - who added this tag',
  
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
-- SUMMARY OF ENHANCEMENTS
-- ============================================================================
-- ✅ AUTHENTICITY & TRUST
--    - Verification workflow (pending → approved/rejected)
--    - Verified expert curators with badges
--    - Authenticity ratings and community feedback
--    - Audit trail of all changes
--
-- ✅ CULTURAL STORYTELLING
--    - Country/region/cuisine metadata
--    - Festival/occasion connections
--    - Cultural notes in reviews
--    - History and origin tracking
--    - Regional variations support
--    - Geographic coordinates for map browsing
--
-- ✅ COMMUNITY & CONTRIBUTIONS
--    - User roles and reputation system
--    - Community reviews with detailed feedback
--    - Contribution tracking
--    - Expert verification badges
--    - Moderation tools
--
-- ✅ SEARCH & DISCOVERY
--    - FULLTEXT indexes for fast searching
--    - SEO-friendly slugs and metadata
--    - Multiple filtering dimensions (cuisine, festival, tags, difficulty)
--    - Geographic/map-based browsing
--    - Advanced ingredient search
--
-- ✅ DATA INTEGRITY & SCALABILITY
--    - Foreign key constraints
--    - Proper normalization (ingredients, cuisines, festivals as separate tables)
--    - Indexes on frequently-queried columns
--    - Soft deletion for audit trails
--    - Changelog for data recovery
--
-- ✅ SEO OPTIMIZATION
--    - Slug fields for clean URLs
--    - Short descriptions for meta tags
--    - FULLTEXT indexes for search engines
--    - Structured data support (schema.org)
--
-- ✅ AI & FUTURE FEATURES
--    - Authenticity scoring for ML models
--    - Ingredient master data for recipe generation
--    - Changelog for training data
--    - Structured variations for learning
--    - Recipe versioning for tracking improvements
--
-- ✅ PERFORMANCE CONSIDERATIONS
--    - Strategic indexes on foreign keys
--    - Indexes on status/filtering fields
--    - Composite indexes for common queries
--    - JSON columns for flexible data
--    - Spatial indexes for geographic queries
--    - Generated columns for computed values
--
-- ============================================================================
