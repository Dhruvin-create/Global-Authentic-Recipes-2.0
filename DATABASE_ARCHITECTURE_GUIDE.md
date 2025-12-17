# Global Authentic Recipes - Enhanced Database Schema v2.0
## Implementation Guide & Architecture Documentation

---

## 📋 TABLE OF CONTENTS
1. [Architecture Overview](#architecture-overview)
2. [Migration Path](#migration-path)
3. [Table-by-Table Breakdown](#table-by-table-breakdown)
4. [Query Examples](#query-examples)
5. [Performance Optimization](#performance-optimization)
6. [Data Integrity Rules](#data-integrity-rules)
7. [SEO & Discovery](#seo--discovery)
8. [AI & Machine Learning](#ai--machine-learning)

---

## 🏗️ ARCHITECTURE OVERVIEW

### Design Principles

1. **Backward Compatibility**: Existing `recipes` table enhanced with new optional columns
2. **Normalization**: Related data separated into dedicated tables for integrity and flexibility
3. **Scalability**: Designed for millions of recipes and thousands of concurrent users
4. **Audit Trail**: Soft deletes and changelog tracking for transparency
5. **Cultural Authenticity**: Dedicated tables for regions, cuisines, festivals, and expert verification
6. **Performance**: Strategic indexes on query paths; JSON for flexible data storage

### Entity Relationship Overview

```
USERS (Contributors & Curators)
  ├── Contributes → RECIPES
  ├── Creates → RECIPE_REVIEWS
  ├── Verifies → RECIPES
  └── Manages → RECIPE_VERIFICATION_HISTORY

RECIPES (Core Recipe Data)
  ├── Many → RECIPE_INGREDIENTS (with INGREDIENTS master)
  ├── Many → COOKING_STEPS (detailed instructions)
  ├── Many → RECIPE_REVIEWS (community feedback)
  ├── Many → RECIPE_CUISINES (with CUISINES master)
  ├── Many → RECIPE_FESTIVALS (with FESTIVALS_OCCASIONS master)
  ├── Many → RECIPE_VARIATIONS (regional adaptations)
  ├── Many → RECIPE_TAGS (with RECIPE_TAGS master)
  └── History → RECIPE_CHANGELOG (audit trail)

GEOGRAPHIC_COORDINATES
  └── Location data for maps and regional browsing
```

---

## 🔄 MIGRATION PATH

### Phase 1: Backward-Compatible Enhancements (No Data Loss)

```sql
-- Add new columns to existing recipes table
-- All columns default to NULL or safe defaults
-- Existing recipes unaffected

ALTER TABLE recipes ADD COLUMN authenticity_status ENUM(...) DEFAULT 'community';
ALTER TABLE recipes ADD COLUMN slug VARCHAR(255) UNIQUE;
-- ... etc
```

**Risk Level**: ✅ LOW - No deletions, no breaking changes

### Phase 2: Create Master Data Tables

1. Create `users`, `ingredients`, `cuisines`, `festivals_occasions` tables
2. Populate cuisines with standard taxonomy
3. Populate festivals from cultural calendar

**Risk Level**: ✅ LOW - Standalone tables, no dependencies yet

### Phase 3: Create Junction/Detail Tables

1. Create `recipe_ingredients`, `cooking_steps`, etc.
2. Migrate existing ingredient text → `recipe_ingredients`
3. Migrate existing steps → `cooking_steps`

**Risk Level**: ⚠️ MEDIUM - Requires careful data transformation

### Phase 4: Activate Verification Workflow

1. Create `recipe_verification_history`, `users` table with roles
2. Begin flagging recipes for review
3. Gradually move recipes through verification

**Risk Level**: ⚠️ MEDIUM - Changes to recipe status

### Phase 5: Add User-Generated Content

1. Enable `recipe_reviews` and community ratings
2. Add `recipe_variations` for regional recipes
3. Activate `recipe_changelog` for full audit trail

**Risk Level**: ✅ LOW - Additive only

---

## 📊 TABLE-BY-TABLE BREAKDOWN

### 1. RECIPES TABLE (Enhanced)

**New Columns Added:**
- `authenticity_status` - Classify recipes as verified/community/AI/pending
- `slug` - URL-friendly ID for SEO
- `short_description` - Meta description for search engines
- `country_code`, `country_name` - Geographic origin
- `region` - Specific region/state/province
- `cuisine_type` - Cuisine classification
- `festival_occasion` - Associated cultural event
- `season` - Seasonal availability
- `spice_level` - Heat level (0-5)
- `prep_time_minutes` - Preparation time
- `cook_time_minutes` - Active cooking time
- `total_time_minutes` - Generated field (prep + cook)
- `servings` - Number of servings
- `status` - Publication workflow (published/draft/archived/flagged)
- `is_deleted` - Soft delete flag
- `version_number` - Recipe version tracking
- `parent_recipe_id` - For regional variations
- `view_count` - Analytics
- `community_rating` - Aggregated star rating
- `authenticity_score` - ML confidence (0-1)
- `created_by_user_id` - Recipe author
- `verified_by_user_id` - Verification expert
- `verified_at` - Verification timestamp

**Why These Fields:**
- Authenticity tracking enables trust building and verification workflows
- Geographic/cultural metadata supports regional discovery
- Time fields enable filtering by prep time
- Soft delete maintains historical data for analytics
- Version tracking supports recipe evolution
- ML scoring supports AI features

**Indexes:**
```sql
CREATE INDEX idx_authenticity_status ON recipes(authenticity_status);
CREATE INDEX idx_country_cuisine ON recipes(country_code, cuisine_type);
CREATE INDEX idx_status_published ON recipes(status, published_at DESC);
CREATE FULLTEXT INDEX ft_recipe_search ON recipes(title, short_description, history);
```

**Query Examples:**
```sql
-- Find verified Italian recipes
SELECT * FROM recipes 
WHERE authenticity_status = 'verified' 
  AND cuisine_type = 'Italian'
ORDER BY community_rating DESC;

-- Search with full-text (for SEO)
SELECT * FROM recipes
WHERE MATCH(title, short_description, history) AGAINST('authentic pasta' IN BOOLEAN MODE);

-- Filter by difficulty and time
SELECT * FROM recipes
WHERE difficulty = 'Easy'
  AND total_time_minutes <= 30
  AND status = 'published';
```

---

### 2. USERS TABLE (New)

**Purpose**: Track contributors, enable reputation system, support verification roles

**Key Fields:**
- `role` - viewer/contributor/moderator/expert_curator/admin
- `reputation_score` - Community trust metric
- `is_verified_curator` - Expert badge for authenticity verification
- `recipes_verified` - Count of recipes this curator verified
- `is_suspended` - Moderation flag

**Why Separate Table:**
- Supports multi-role access control
- Enables reputation tracking and gamification
- Allows curator verification system
- Maintains audit trail of contributor identity
- Enables user suspension and account management

**Indexes:**
```sql
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_is_verified_curator ON users(is_verified_curator);
CREATE INDEX idx_reputation_score ON users(reputation_score DESC);
```

---

### 3. INGREDIENTS TABLE (New)

**Purpose**: Master list of ingredients for normalization and ingredient-based search

**Key Fields:**
- `category`, `subcategory` - Type hierarchy
- `primary_origin_country`, `primary_origin_region` - Sourcing
- `common_substitutes` - JSON array of substitute ingredient IDs
- `cultural_variants` - Regional alternatives (e.g., Pecorino vs. Parmesan)
- Dietary flags: `is_vegan`, `is_vegetarian`, `is_gluten_free`, `is_nut_free`
- `allergen_info` - Comprehensive allergen tracking
- `availability` - Seasonal/year-round/rare
- `fair_trade_available`, `organic_available` - Ethical sourcing

**Why Separate Table:**
- ✅ Enables ingredient-based search ("find recipes with avocado")
- ✅ Allows substitution suggestions ("can't find guanciale? use bacon")
- ✅ Supports dietary filtering ("vegan pasta alternatives")
- ✅ Tracks ingredient sourcing and ethics
- ✅ Provides single source of truth for ingredient data
- ✅ Enables ingredient availability calendars

**Query Examples:**
```sql
-- Find recipes using specific ingredient
SELECT r.* FROM recipes r
JOIN recipe_ingredients ri ON r.id = ri.recipe_id
JOIN ingredients i ON ri.ingredient_id = i.id
WHERE i.name = 'Parmesan Cheese';

-- Find vegan substitutes
SELECT * FROM ingredients
WHERE is_vegan = TRUE
  AND common_substitutes LIKE '%"Parmesan"%';

-- Seasonal ingredient filtering
SELECT * FROM recipes r
JOIN recipe_ingredients ri ON r.id = ri.recipe_id
JOIN ingredients i ON ri.ingredient_id = i.id
WHERE i.availability IN ('year_round', 'seasonal')
  AND i.peak_season = 'summer';
```

---

### 4. RECIPE_INGREDIENTS TABLE (New)

**Purpose**: Normalize recipe ingredients with quantity, preparation, and substitution data

**Key Fields:**
- `quantity`, `unit` - Measurement data
- `display_text` - "2 1/2 cups flour" (formatted for UI)
- `preparation_notes` - "chopped", "minced", "grated"
- `optional` - Whether ingredient is required
- `display_order` - Ingredient list order
- `can_be_substituted` - Is substitution allowed?
- `suggested_substitutes` - Comma-separated alternatives

**Why Separate Table:**
- ✅ Flexible quantity/unit storage (grams, cups, tbsp, whole, pinch)
- ✅ Ingredient preparation hints
- ✅ Optional ingredients (e.g., "garnish with basil")
- ✅ Substitution engine foundation
- ✅ Enables ingredient-swapping in "plan a meal" features
- ✅ Better normalization for data integrity

**Indexes:**
```sql
CREATE UNIQUE INDEX uk_recipe_ingredient_order ON recipe_ingredients(recipe_id, display_order);
CREATE INDEX idx_recipe_id ON recipe_ingredients(recipe_id);
```

**Query Examples:**
```sql
-- Get all ingredients for recipe #42
SELECT i.name, ri.quantity, ri.unit, ri.preparation_notes
FROM recipe_ingredients ri
JOIN ingredients i ON ri.ingredient_id = i.id
WHERE ri.recipe_id = 42
ORDER BY ri.display_order;

-- Find all recipes needing dairy-free substitutes
SELECT DISTINCT r.id, r.title
FROM recipes r
JOIN recipe_ingredients ri ON r.id = ri.recipe_id
JOIN ingredients i ON ri.ingredient_id = i.id
WHERE ri.can_be_substituted = TRUE
  AND i.category = 'Dairy';
```

---

### 5. COOKING_STEPS TABLE (New)

**Purpose**: Rich, structured cooking instructions with media, timing, and equipment tracking

**Key Fields:**
- `step_number`, `title`, `description` - Step content
- `estimated_duration_seconds` - How long this step takes
- `can_be_done_ahead` - Prep-ahead capability
- `image_url`, `video_url` - Media for visual learners
- `alternative_methods` - JSON array of techniques
- `required_equipment` - Equipment needed
- `difficulty_level` - Per-step difficulty (1-5)
- `common_mistakes`, `tips`, `warnings` - User guidance
- `ingredients_used` - JSON array of ingredient IDs used in this step

**Why Separate Table:**
- ✅ Supports "Cook Mode" with step-by-step timer
- ✅ Enables video tutorials per step
- ✅ Step-by-step difficulty levels (some steps harder than others)
- ✅ Accessibility: clear steps for beginners
- ✅ Equipment alternatives for different kitchens
- ✅ Ingredient references within steps
- ✅ Common mistakes and pro tips

**Query Examples:**
```sql
-- Get all steps for recipe #42 with timing
SELECT step_number, title, estimated_duration_seconds, description, image_url
FROM cooking_steps
WHERE recipe_id = 42
ORDER BY step_number;

-- Find steps that need specific equipment
SELECT DISTINCT cs.* FROM cooking_steps cs
WHERE FIND_IN_SET('stand mixer', cs.required_equipment)
ORDER BY cs.recipe_id, cs.step_number;

-- Total cooking time with step breakdown
SELECT 
  recipe_id,
  COUNT(*) as total_steps,
  SUM(estimated_duration_seconds) / 60 as total_time_minutes
FROM cooking_steps
WHERE recipe_id = 42
GROUP BY recipe_id;
```

---

### 6. RECIPE_REVIEWS TABLE (New)

**Purpose**: Community validation and cultural feedback on recipes

**Key Fields:**
- `rating_stars` - Overall rating (1-5)
- `taste_rating`, `authenticity_rating`, `difficulty_rating`, `ease_to_follow` - Detailed ratings
- `title`, `review_text` - Review content
- `cultural_notes` - Cultural insights from reviewer
- `regional_variation` - Regional differences noted
- `family_connection` - Personal connection to recipe
- `modifications_made` - What reviewer changed
- `suggested_improvements` - Enhancement ideas
- `substitutions_used` - Ingredient changes made
- `photo_url` - Photo of cooked dish
- `verified_purchase_or_cooked` - Verified cook
- `helpful_votes`, `unhelpful_votes` - Community feedback

**Why Separate Table:**
- ✅ Builds community trust through verified reviews
- ✅ Authenticity ratings validate cultural accuracy
- ✅ Collects user modifications (valuable for recipe improvement)
- ✅ Photos provide visual proof and inspiration
- ✅ Cultural notes preserve regional knowledge
- ✅ Difficulty feedback validates recipe metadata
- ✅ Helpful vote system surfaces best reviews

**Indexes:**
```sql
CREATE UNIQUE INDEX uk_recipe_user_review ON recipe_reviews(recipe_id, user_id);
CREATE INDEX idx_rating_stars ON recipe_reviews(rating_stars DESC);
CREATE INDEX idx_authenticity_rating ON recipe_reviews(authenticity_rating DESC);
```

**Query Examples:**
```sql
-- Get average ratings for recipe
SELECT 
  recipe_id,
  COUNT(*) as review_count,
  AVG(rating_stars) as avg_rating,
  AVG(authenticity_rating) as avg_authenticity
FROM recipe_reviews
WHERE recipe_id = 42 AND is_flagged = FALSE
GROUP BY recipe_id;

-- Most helpful reviews
SELECT * FROM recipe_reviews
WHERE recipe_id = 42
ORDER BY (helpful_votes - unhelpful_votes) DESC
LIMIT 10;

-- Reviews with photos (for homepage showcase)
SELECT * FROM recipe_reviews
WHERE recipe_id = 42 
  AND photo_url IS NOT NULL
  AND verified_purchase_or_cooked = TRUE
LIMIT 5;
```

---

### 7. RECIPE_VARIATIONS TABLE (New)

**Purpose**: Track regional and family recipe adaptations while maintaining recipe lineage

**Key Fields:**
- `variation_type` - regional/family/dietary_adaptation/modern_twist/historical
- `region_or_source` - "Sicilian variation", "Nonna Maria's version"
- `ingredient_differences`, `technique_differences` - What changes
- `source_cuisine` - "Sicilian", "Turkish", etc.
- `documented_since_year` - Historical reference
- `verified` - Authenticity verification
- `created_by_user_id`, `verified_by_user_id` - Attribution

**Why Separate Table:**
- ✅ Maintains recipe lineage and relationships
- ✅ Enables regional recipe browsing
- ✅ Documents how recipes evolve across regions
- ✅ Supports cultural storytelling
- ✅ Enables "show me 10 pasta carbonara variations" queries
- ✅ Tracks family recipe histories
- ✅ Supports versioning and recipe evolution

**Query Examples:**
```sql
-- Find all regional variations of a recipe
SELECT rv.*, r.title as variation_name
FROM recipe_variations rv
JOIN recipes r ON rv.variation_recipe_id = r.id
WHERE rv.original_recipe_id = 42
ORDER BY rv.variation_type;

-- Show recipe family tree
SELECT 
  rv.region_or_source,
  rv.variation_type,
  rv.verified
FROM recipe_variations rv
WHERE rv.original_recipe_id = 42 OR rv.variation_recipe_id = 42;
```

---

### 8. RECIPE_VERIFICATION_HISTORY TABLE (New)

**Purpose**: Complete audit trail of verification workflow for transparency and compliance

**Key Fields:**
- `action` - submitted/under_review/approved/rejected/flagged/archived
- `actor_user_id` - Which admin/curator made this decision
- `notes` - Reason for action
- `required_changes` - If rejected, what needs fixing
- `authenticity_feedback` - Expert assessment

**Why Separate Table:**
- ✅ Maintains complete audit trail for compliance
- ✅ Shows users why their recipe was rejected
- ✅ Tracks expert verification decisions
- ✅ Enables workflow state tracking
- ✅ Provides transparency for verification process
- ✅ Supports data recovery and historical queries

**Query Examples:**
```sql
-- Verification workflow status
SELECT * FROM recipe_verification_history
WHERE recipe_id = 42
ORDER BY created_at DESC;

-- Recipes pending review
SELECT DISTINCT r.id, r.title, MAX(rvh.created_at) as last_action
FROM recipes r
JOIN recipe_verification_history rvh ON r.id = rvh.recipe_id
WHERE rvh.action IN ('submitted', 'under_review')
  AND NOT EXISTS (
    SELECT 1 FROM recipe_verification_history rvh2
    WHERE rvh2.recipe_id = r.id
      AND rvh2.action IN ('approved', 'rejected')
      AND rvh2.created_at > rvh.created_at
  )
GROUP BY r.id
ORDER BY last_action;
```

---

### 9. CUISINES TABLE (New)

**Purpose**: Standardized cuisine taxonomy for classification and filtering

**Key Fields:**
- `name`, `slug` - Cuisine identity
- `region` - Geographic region (e.g., "Southern Europe")
- `country_codes` - JSON array of countries
- `key_ingredients`, `cooking_methods` - Characteristics
- `cultural_significance` - Context and traditions
- `parent_cuisine_id` - Hierarchy (Italian → Southern Italian)

**Why Separate Table:**
- ✅ Single source of truth for cuisine definitions
- ✅ Enables cuisine hierarchy browsing
- ✅ Supports SEO with canonical cuisine pages
- ✅ Allows "show all Italian recipes" queries
- ✅ Separates cuisine master data from recipes

**Query Examples:**
```sql
-- All recipes in a cuisine
SELECT r.* FROM recipes r
JOIN recipe_cuisines rc ON r.id = rc.recipe_id
JOIN cuisines c ON rc.cuisine_id = c.id
WHERE c.slug = 'italian'
  AND r.status = 'published'
ORDER BY r.community_rating DESC;

-- Cuisine hierarchy (show all sub-cuisines)
SELECT * FROM cuisines
WHERE parent_cuisine_id = (SELECT id FROM cuisines WHERE slug = 'italian');
```

---

### 10. FESTIVALS_OCCASIONS TABLE (New)

**Purpose**: Cultural events and seasonal occasions for discovery

**Key Fields:**
- `name`, `slug` - Festival identity
- `description` - History and significance
- `date_month`, `date_day` - When celebrated
- `is_lunar` - Lunar calendar based
- `primary_countries` - Where celebrated
- `duration_days` - How long it lasts

**Why Separate Table:**
- ✅ Enables seasonal recipe browsing ("Christmas recipes")
- ✅ Supports festival-themed collections
- ✅ Tracks cultural calendar
- ✅ Enables "what to cook next week?" queries
- ✅ Supports global cultural representation

**Query Examples:**
```sql
-- Recipes for upcoming festival
SELECT r.* FROM recipes r
JOIN recipe_festivals rf ON r.id = rf.recipe_id
JOIN festivals_occasions f ON rf.festival_id = f.id
WHERE MONTH(NOW()) = f.date_month
  AND f.date_day >= DAY(NOW())
ORDER BY f.date_day;

-- All Christmas recipes
SELECT r.* FROM recipes r
JOIN recipe_festivals rf ON r.id = rf.recipe_id
JOIN festivals_occasions f ON rf.festival_id = f.id
WHERE f.slug = 'christmas'
  AND r.status = 'published'
ORDER BY r.community_rating DESC;
```

---

### 11. GEOGRAPHIC_COORDINATES TABLE (New)

**Purpose**: Enable map-based recipe discovery

**Key Fields:**
- `country_code`, `country_name`, `region_name` - Location
- `latitude`, `longitude` - Map coordinates
- `primary_cuisine_ids` - Cuisines from this region
- `SPATIAL INDEX` - For geographic queries

**Why Separate Table:**
- ✅ Enables map-based recipe browsing
- ✅ Supports "find recipes from nearby countries"
- ✅ Location-based recommendations
- ✅ Spatial queries for advanced discovery
- ✅ Single source for geographic data

**Query Examples:**
```sql
-- Recipes from a region (using spatial index)
SELECT r.* FROM recipes r
WHERE r.country_code IN (
  SELECT country_code FROM geographic_coordinates
  WHERE ST_Distance(POINT(latitude, longitude), POINT(40.7128, -74.0060)) < 5
);

-- All recipes from Italy
SELECT r.* FROM recipes r
WHERE r.country_code = 'IT'
ORDER BY r.community_rating DESC;
```

---

### 12. RECIPE_TAGS TABLE (New)

**Purpose**: Flexible user-driven categorization for discovery

**Key Fields:**
- `tag_name`, `slug` - Tag identity
- `category` - Type of tag (technique/dietary/time/occasion)
- `recipe_count` - Usage metric
- `usage_frequency` - Popularity

**Why Separate Table:**
- ✅ Flexible tagging beyond fixed categories
- ✅ Supports user-created tags like "no-bake", "quick-weeknight"
- ✅ Trending topic tracking
- ✅ Better search with natural language
- ✅ Enables "show similar recipes" features

**Query Examples:**
```sql
-- Recipes with specific tag
SELECT r.* FROM recipes r
JOIN recipe_tags_relation rtr ON r.id = rtr.recipe_id
JOIN recipe_tags rt ON rtr.tag_id = rt.id
WHERE rt.slug = 'no-bake'
ORDER BY r.community_rating DESC;

-- Trending tags
SELECT tag_name, recipe_count
FROM recipe_tags
WHERE category = 'technique'
ORDER BY usage_frequency DESC
LIMIT 10;
```

---

### 13. RECIPE_CHANGELOG TABLE (New)

**Purpose**: Complete version history for transparency and AI training

**Key Fields:**
- `change_type` - created/updated/verified/translated/image_updated/metadata_updated
- `changed_fields` - JSON object of changes
- `changed_by_user_id` - Who made the change
- `change_reason` - Why the change was made
- `previous_version_snapshot` - Full JSON snapshot before change

**Why Separate Table:**
- ✅ Complete version history for audit
- ✅ Enables recipe rollback if needed
- ✅ Tracks all modifications and translations
- ✅ Provides data for ML training
- ✅ Shows recipe evolution over time
- ✅ Transparency in community recipes

**Query Examples:**
```sql
-- Full change history for recipe
SELECT * FROM recipe_changelog
WHERE recipe_id = 42
ORDER BY created_at DESC;

-- Who translated a recipe
SELECT * FROM recipe_changelog
WHERE recipe_id = 42 AND change_type = 'translated'
ORDER BY created_at DESC;

-- All changes in last month
SELECT COUNT(*), change_type
FROM recipe_changelog
WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY change_type;
```

---

## 🔍 QUERY EXAMPLES

### 1. Advanced Recipe Discovery

```sql
-- Find easy, quick, authentic Italian recipes with 5+ stars
SELECT 
  r.id,
  r.title,
  r.slug,
  r.total_time_minutes,
  r.community_rating,
  r.authenticity_status,
  c.name as cuisine,
  GROUP_CONCAT(DISTINCT rt.tag_name) as tags
FROM recipes r
LEFT JOIN recipe_cuisines rc ON r.id = rc.recipe_id
LEFT JOIN cuisines c ON rc.cuisine_id = c.id
LEFT JOIN recipe_tags_relation rtr ON r.id = rtr.recipe_id
LEFT JOIN recipe_tags rt ON rtr.tag_id = rt.id
WHERE r.status = 'published'
  AND r.difficulty = 'Easy'
  AND r.total_time_minutes <= 30
  AND r.authenticity_status IN ('verified', 'community')
  AND r.community_rating >= 4.5
  AND r.country_code = 'IT'
GROUP BY r.id
ORDER BY r.community_rating DESC, r.view_count DESC;
```

### 2. Seasonal Discovery

```sql
-- Recipes perfect for this week's festival (multi-region)
SELECT 
  r.id,
  r.title,
  f.name as festival,
  r.country_name,
  rf.significance
FROM recipes r
JOIN recipe_festivals rf ON r.id = rf.recipe_id
JOIN festivals_occasions f ON rf.festival_id = f.id
WHERE r.status = 'published'
  AND (
    DATEDIFF(CURDATE(), CONCAT(YEAR(CURDATE()), '-', f.date_month, '-', f.date_day)) BETWEEN 0 AND 7
    OR DATEDIFF(CURDATE(), CONCAT(YEAR(CURDATE()) + 1, '-', f.date_month, '-', f.date_day)) BETWEEN 0 AND 7
  )
ORDER BY r.community_rating DESC;
```

### 3. Full-Text Search with Filters

```sql
-- Search "authentic pasta" with dietary restrictions
SELECT 
  r.id,
  r.title,
  r.slug,
  MATCH(r.title, r.short_description, r.history) AGAINST('authentic pasta' IN BOOLEAN MODE) as relevance
FROM recipes r
WHERE MATCH(r.title, r.short_description, r.history) 
      AGAINST('authentic pasta' IN BOOLEAN MODE)
  AND r.status = 'published'
  AND NOT EXISTS (
    SELECT 1 FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.id
    WHERE ri.recipe_id = r.id
      AND (i.name LIKE '%dairy%' OR i.category = 'Dairy')
  )
ORDER BY relevance DESC;
```

### 4. Recipe Variations Explorer

```sql
-- Show "Pasta Carbonara" family with all variations
SELECT 
  CASE 
    WHEN r.id = 42 THEN 'Original'
    ELSE rv.variation_type
  END as type,
  r.title,
  r.country_name,
  r.region,
  rv.region_or_source,
  rv.description,
  rv.verified
FROM recipes r
LEFT JOIN recipe_variations rv ON (
  rv.original_recipe_id = 42 AND rv.variation_recipe_id = r.id
  OR r.id = 42
)
WHERE r.id = 42 
   OR rv.original_recipe_id = 42
ORDER BY CASE WHEN r.id = 42 THEN 0 ELSE 1 END, rv.variation_type;
```

### 5. Ingredient Substitution Finder

```sql
-- Show recipes with "guanciale" and available substitutes
SELECT 
  r.id,
  r.title,
  ri.display_text,
  ri.quantity,
  ri.unit,
  COALESCE(GROUP_CONCAT(i_sub.name SEPARATOR ', '), 'No common substitutes') as substitutes
FROM recipes r
JOIN recipe_ingredients ri ON r.id = ri.recipe_id
JOIN ingredients i ON ri.ingredient_id = i.id
LEFT JOIN ingredients i_sub ON FIND_IN_SET(i_sub.id, i.common_substitutes)
WHERE i.name = 'Guanciale'
  AND r.status = 'published'
GROUP BY r.id, ri.id
ORDER BY r.community_rating DESC;
```

### 6. Expert Verification Dashboard

```sql
-- Recipes pending verification (not yet reviewed by curators)
SELECT 
  r.id,
  r.title,
  r.created_by_user_id,
  u.display_name as contributor,
  r.created_at,
  COUNT(rr.id) as review_count,
  AVG(rr.rating_stars) as avg_rating
FROM recipes r
JOIN users u ON r.created_by_user_id = u.id
LEFT JOIN recipe_reviews rr ON r.id = rr.recipe_id
WHERE r.status = 'published'
  AND r.authenticity_status IN ('pending_review', 'community')
  AND r.verified_by_user_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM recipe_verification_history rvh
    WHERE rvh.recipe_id = r.id 
      AND rvh.action IN ('approved', 'rejected')
  )
GROUP BY r.id
ORDER BY r.created_at ASC;
```

### 7. Recipe Popularity Analytics

```sql
-- Top recipes by engagement
SELECT 
  r.id,
  r.title,
  r.view_count,
  COUNT(rr.id) as review_count,
  SUM(rr.helpful_votes) as total_helpful_votes,
  (r.view_count + COUNT(rr.id) * 10 + SUM(COALESCE(rr.helpful_votes, 0)) * 20) as engagement_score
FROM recipes r
LEFT JOIN recipe_reviews rr ON r.id = rr.recipe_id
WHERE r.status = 'published'
  AND r.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY r.id
ORDER BY engagement_score DESC
LIMIT 20;
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Index Strategy

1. **Foreign Keys**: Always indexed for JOIN operations
   ```sql
   CREATE INDEX idx_recipe_id ON recipe_ingredients(recipe_id);
   CREATE INDEX idx_ingredient_id ON recipe_ingredients(ingredient_id);
   ```

2. **Filtering Columns**: Indexes on status, category, difficulty
   ```sql
   CREATE INDEX idx_status_published ON recipes(status, published_at DESC);
   CREATE INDEX idx_authenticity_status ON recipes(authenticity_status);
   ```

3. **Sort Columns**: Indexes on commonly sorted fields
   ```sql
   CREATE INDEX idx_community_rating ON recipes(community_rating DESC);
   CREATE INDEX idx_view_count ON recipes(view_count DESC);
   ```

4. **Full-Text Search**: FULLTEXT indexes for natural language
   ```sql
   FULLTEXT INDEX ft_recipe_search ON recipes(title, short_description, history);
   ```

5. **Composite Indexes**: Multi-column indexes for common filter combos
   ```sql
   CREATE INDEX idx_country_cuisine ON recipes(country_code, cuisine_type);
   ```

### Query Optimization Tips

1. **Use EXISTS instead of IN** for subqueries:
   ```sql
   -- ✅ FAST
   WHERE EXISTS (SELECT 1 FROM recipe_reviews WHERE recipe_id = r.id AND rating_stars >= 4)
   
   -- ❌ SLOW
   WHERE recipe_id IN (SELECT recipe_id FROM recipe_reviews WHERE rating_stars >= 4)
   ```

2. **Limit GROUP BY results**:
   ```sql
   -- ✅ FAST - Only retrieve necessary data
   SELECT r.id, r.title, AVG(rr.rating_stars)
   FROM recipes r
   LEFT JOIN recipe_reviews rr ON r.id = rr.recipe_id
   WHERE r.status = 'published'
   GROUP BY r.id
   LIMIT 50;
   ```

3. **Use EXPLAIN to analyze queries**:
   ```sql
   EXPLAIN SELECT * FROM recipes 
   WHERE country_code = 'IT' 
     AND status = 'published'
     AND community_rating > 4;
   ```

4. **Avoid SELECT *** - only retrieve needed columns:
   ```sql
   -- ✅ FAST
   SELECT r.id, r.title, r.slug, r.community_rating
   
   -- ❌ SLOW
   SELECT * FROM recipes
   ```

### Denormalization Strategy

Some computed fields are denormalized for performance:

1. **`recipes.total_time_minutes`** - Generated field from prep + cook time
2. **`recipes.community_rating`** - Cached from recipe_reviews
3. **`recipe_tags.recipe_count`** - Updated when tags added/removed
4. **`users.reputation_score`** - Periodically recalculated from contributions

---

## 🔒 DATA INTEGRITY RULES

### Foreign Key Constraints

```sql
-- Prevent orphaned data
CONSTRAINT fk_recipe_ingredients_recipe FOREIGN KEY (recipe_id) 
  REFERENCES recipes(id) ON DELETE CASCADE;

-- Prevent ingredient deletion if in use
CONSTRAINT fk_recipe_ingredients_ingredient FOREIGN KEY (ingredient_id) 
  REFERENCES ingredients(id) ON DELETE RESTRICT;

-- Soft delete, don't remove user records
CONSTRAINT fk_recipe_reviews_user FOREIGN KEY (user_id) 
  REFERENCES users(id) ON DELETE CASCADE;
```

### Check Constraints

```sql
-- Rating must be 1-5 stars
CHECK (rating_stars >= 1 AND rating_stars <= 5)

-- Spice level 0-5
CHECK (spice_level >= 0 AND spice_level <= 5)

-- Authenticity score 0-1
CHECK (authenticity_score >= 0 AND authenticity_score <= 1)
```

### Unique Constraints

```sql
-- One review per user per recipe
UNIQUE KEY uk_recipe_user_review (recipe_id, user_id)

-- URL slugs must be unique
UNIQUE INDEX idx_slug ON recipes(slug)

-- Ingredient names unique
UNIQUE KEY uk_ingredient_name (name)
```

### Business Rules

1. **Soft Delete**: Mark `is_deleted = TRUE` instead of removing
2. **Audit Trail**: All changes tracked in `recipe_changelog`
3. **Verification**: Recipe can't be "verified" without approving curator
4. **Status Flow**: published → archived, or flagged_review → archived
5. **Timestamps**: `created_at` never changes; `updated_at` on every modification

---

## 🔍 SEO & DISCOVERY

### URL Structure

```
/recipes/classic-pasta-carbonara             (r.slug)
/cuisine/italian                             (c.slug)
/festival/christmas                          (f.slug)
/ingredient/parmesan-cheese                  (i.slug)
/search?q=pasta&difficulty=easy&time=30      (Full-text + filters)
```

### SEO Fields

Each recipe stores:
- `title` - Clear, keyword-rich title
- `slug` - Unique, readable URL identifier
- `short_description` - For meta tags (max 160 chars)
- `history` - Long-form content for SEO
- `country_code`, `cuisine_type`, `festival_occasion` - Structural data

### Structured Data Support

Schema.org Recipe format:
```json
{
  "@type": "Recipe",
  "name": "Classic Pasta Carbonara",
  "description": "Traditional Roman pasta dish",
  "recipeIngredient": [...],
  "recipeInstructions": [...],
  "prepTime": "PT20M",
  "cookTime": "PT15M",
  "totalTime": "PT35M",
  "recipeYield": "4 servings",
  "author": {
    "@type": "Person",
    "name": "Nonna Maria"
  },
  "aggregateRating": {
    "ratingValue": "4.8",
    "ratingCount": "142"
  }
}
```

### FULLTEXT Index Strategy

```sql
-- Recipe search index
FULLTEXT INDEX ft_recipe_search ON recipes(title, short_description, history)

-- Query example
SELECT * FROM recipes
WHERE MATCH(title, short_description, history) 
      AGAINST('+authentic +pasta -carbonara' IN BOOLEAN MODE)
ORDER BY MATCH(title, short_description, history) 
         AGAINST('+authentic +pasta -carbonara' IN BOOLEAN MODE) DESC;
```

---

## 🤖 AI & MACHINE LEARNING

### Data Ready for ML

1. **Recipe Embeddings**
   - Use title, description, ingredients for semantic similarity
   - Train model: "given recipe A, recommend similar recipes"

2. **Authenticity Scoring**
   - `authenticity_score` field stores ML confidence (0-1)
   - Input features: verification status, expert reviews, cultural metadata
   - Output: confidence that recipe is authentic

3. **Recommendation Engine**
   - Features: cuisine, difficulty, time, ingredients, user history
   - Generate personalized recipe suggestions

4. **AI Recipe Generation**
   - Train on existing recipes to generate new ones
   - Mark as `authenticity_status = 'ai_generated'` for human review
   - Use changelog for training data

5. **Image Analysis**
   - Analyze recipe photos to verify dish appearance
   - Validate user-submitted review photos

### Training Data Available

```sql
-- Export training data for ML models
SELECT 
  r.id,
  r.title,
  r.short_description,
  r.history,
  GROUP_CONCAT(i.name ORDER BY ri.display_order) as ingredients,
  GROUP_CONCAT(cs.description ORDER BY cs.step_number) as steps,
  r.difficulty,
  r.cuisine_type,
  r.country_code,
  r.community_rating,
  r.authenticity_status,
  COUNT(DISTINCT rr.id) as review_count,
  AVG(rr.authenticity_rating) as avg_authenticity_rating
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN ingredients i ON ri.ingredient_id = i.id
LEFT JOIN cooking_steps cs ON r.id = cs.recipe_id
LEFT JOIN recipe_reviews rr ON r.id = rr.recipe_id
WHERE r.status = 'published'
GROUP BY r.id;
```

### Versioning for Improvement Tracking

```sql
-- Track how recipes improve over time
SELECT 
  r.id,
  r.title,
  r.version_number,
  rc.change_type,
  rc.created_at,
  JSON_EXTRACT(rc.changed_fields, '$.community_rating') as rating_change
FROM recipes r
JOIN recipe_changelog rc ON r.id = rc.recipe_id
WHERE r.status = 'published'
ORDER BY r.id, rc.created_at;
```

---

## 📋 MIGRATION CHECKLIST

- [ ] Phase 1: Add columns to existing recipes table (backward compatible)
- [ ] Phase 2: Create users, cuisines, festivals tables and populate
- [ ] Phase 3: Create ingredients table with master data
- [ ] Phase 4: Create recipe_ingredients, cooking_steps, reviews tables
- [ ] Phase 5: Data migration scripts
  - [ ] Migrate text ingredients → recipe_ingredients
  - [ ] Migrate text steps → cooking_steps
  - [ ] Parse country/region from existing recipes
- [ ] Phase 6: Create verification workflow (users, recipe_verification_history)
- [ ] Phase 7: Build UI for review system and verification
- [ ] Phase 8: Add geographic_coordinates for map features
- [ ] Phase 9: Enable tags and changelog system
- [ ] Phase 10: Deploy and monitor

---

## 🎯 QUICK REFERENCE

### Common Queries at a Glance

```sql
-- Find recipe by any method
SELECT * FROM recipes WHERE slug = 'classic-pasta-carbonara' LIMIT 1;

-- Get all ingredients for recipe
SELECT * FROM recipe_ingredients ri
JOIN ingredients i ON ri.ingredient_id = i.id
WHERE ri.recipe_id = ? ORDER BY ri.display_order;

-- Get all cooking steps
SELECT * FROM cooking_steps WHERE recipe_id = ? ORDER BY step_number;

-- Get reviews and ratings
SELECT * FROM recipe_reviews WHERE recipe_id = ? ORDER BY helpful_votes DESC;

-- Find regional variations
SELECT * FROM recipe_variations WHERE original_recipe_id = ? OR variation_recipe_id = ?;

-- Search recipes
SELECT * FROM recipes WHERE MATCH(title, short_description, history)
AGAINST(? IN BOOLEAN MODE) AND status = 'published' LIMIT 50;

-- Recipes by cuisine
SELECT * FROM recipes r
JOIN recipe_cuisines rc ON r.id = rc.recipe_id
JOIN cuisines c ON rc.cuisine_id = c.id
WHERE c.slug = ? AND r.status = 'published';

-- Recipes for festival
SELECT * FROM recipes r
JOIN recipe_festivals rf ON r.id = rf.recipe_id
JOIN festivals_occasions f ON rf.festival_id = f.id
WHERE f.slug = ? AND r.status = 'published';
```

---

**Schema Version**: 2.0  
**Last Updated**: December 2025  
**Target Scale**: 1M+ recipes, 100k+ users, 10M+ reviews  
**Maintenance**: Review indexes quarterly; archive old changelog entries yearly
