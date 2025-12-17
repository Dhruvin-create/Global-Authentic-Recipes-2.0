# Database Schema v2.0 - Quick Reference Card

## 📊 NEW TABLES SUMMARY

| Table | Purpose | Key Fields | Relations |
|-------|---------|-----------|-----------|
| `users` | Track contributors & curators | role, reputation_score, is_verified_curator | Many recipes, reviews |
| `ingredients` | Master ingredient data | name, category, substitutes, allergens | Many recipes via junction |
| `recipe_ingredients` | Recipe-ingredient mapping | quantity, unit, preparation | Links recipes & ingredients |
| `cooking_steps` | Detailed cooking instructions | step_number, duration, image_url, equipment | Many per recipe |
| `recipe_reviews` | Community feedback & ratings | rating_stars, authenticity_rating, cultural_notes | One user per recipe |
| `recipe_variations` | Regional/family adaptations | variation_type, region_or_source, verified | Links to parent recipes |
| `recipe_verification_history` | Audit trail | action, actor, notes, feedback | Per recipe action |
| `cuisines` | Cuisine taxonomy | name, region, parent_cuisine_id | Many recipes via junction |
| `recipe_cuisines` | Recipe-cuisine mapping | is_primary | Links recipes & cuisines |
| `festivals_occasions` | Cultural events | name, date_month, date_day, primary_countries | Many recipes via junction |
| `recipe_festivals` | Recipe-festival mapping | significance | Links recipes & festivals |
| `geographic_coordinates` | Location data for maps | country_code, latitude, longitude | Spatial queries |
| `recipe_tags` | Flexible tagging system | tag_name, category, usage_frequency | Many recipes via junction |
| `recipe_tags_relation` | Recipe-tag mapping | added_by_user_id | Links recipes & tags |
| `recipe_changelog` | Version history | change_type, changed_fields, change_reason | Per recipe modification |

---

## 🔧 CRITICAL FIELD ADDITIONS TO RECIPES TABLE

```sql
-- Authenticity & Trust
authenticity_status ENUM('verified', 'community', 'ai_generated', 'pending_review')
authenticity_score DECIMAL(3, 2)  -- 0-1 ML confidence
verified_by_user_id INT
verified_at TIMESTAMP

-- Geographic & Cultural
country_code CHAR(2)              -- ISO country code
country_name VARCHAR(100)
region VARCHAR(100)
cuisine_type VARCHAR(100)
festival_occasion VARCHAR(255)
season ENUM('spring', 'summer', 'autumn', 'winter', 'year_round')

-- SEO
slug VARCHAR(255) UNIQUE           -- for URL: /recipes/slug
short_description VARCHAR(500)     -- for meta tags

-- Timing Details
prep_time_minutes INT
cook_time_minutes INT
total_time_minutes INT GENERATED   -- calculated field
servings INT
spice_level TINYINT(1)             -- 0-5

-- Publication Workflow
status ENUM('published', 'draft', 'archived', 'flagged_review')
is_deleted BOOLEAN                 -- soft delete
deleted_at TIMESTAMP

-- Versioning & Attribution
version_number INT
parent_recipe_id INT               -- for variations
created_by_user_id INT
published_at TIMESTAMP

-- Analytics
view_count INT
community_rating DECIMAL(3, 2)
total_reviews INT
```

---

## 📈 QUERY PATTERNS

### Find Recipes
```sql
-- By slug (most common - SEO friendly)
SELECT * FROM recipes WHERE slug = 'classic-pasta-carbonara';

-- By country/cuisine
SELECT * FROM recipes r
JOIN recipe_cuisines rc ON r.id = rc.recipe_id
JOIN cuisines c ON rc.cuisine_id = c.id
WHERE c.slug = 'italian' AND r.status = 'published';

-- By festival
SELECT * FROM recipes r
JOIN recipe_festivals rf ON r.id = rf.recipe_id
JOIN festivals_occasions f ON rf.festival_id = f.id
WHERE f.slug = 'christmas';

-- Full-text search
SELECT * FROM recipes WHERE MATCH(title, short_description, history)
AGAINST('+pasta +authentic' IN BOOLEAN MODE);
```

### Get Recipe Details
```sql
-- Ingredients (ordered)
SELECT * FROM recipe_ingredients ri
JOIN ingredients i ON ri.ingredient_id = i.id
WHERE ri.recipe_id = ? ORDER BY ri.display_order;

-- Steps (with timing)
SELECT * FROM cooking_steps WHERE recipe_id = ?
ORDER BY step_number;

-- Reviews (most helpful first)
SELECT * FROM recipe_reviews WHERE recipe_id = ?
ORDER BY (helpful_votes - unhelpful_votes) DESC;

-- Variations
SELECT * FROM recipe_variations 
WHERE original_recipe_id = ? OR variation_recipe_id = ?;
```

### Advanced Filtering
```sql
-- Easy, quick, published recipes
SELECT * FROM recipes WHERE 
  difficulty = 'Easy' 
  AND total_time_minutes <= 30 
  AND status = 'published'
  AND authenticity_status IN ('verified', 'community');

-- Vegan recipes available now
SELECT * FROM recipes r
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients ri
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE ri.recipe_id = r.id AND i.is_vegan = FALSE
);

-- Trending recipes (high engagement)
SELECT r.*, COUNT(rr.id) as review_count
FROM recipes r
LEFT JOIN recipe_reviews rr ON r.id = rr.recipe_id
WHERE r.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY r.id
ORDER BY (r.view_count + COUNT(rr.id) * 10) DESC;
```

---

## 🔑 FOREIGN KEY RELATIONSHIPS

```
users (id)
  ← created_by_user_id in recipes (many-to-one)
  ← verified_by_user_id in recipes (many-to-one)
  ← user_id in recipe_reviews (many-to-one)
  ← user_id in recipe_tags_relation (many-to-one)
  ← changed_by_user_id in recipe_changelog (many-to-one)

recipes (id)
  → recipe_ingredients (recipe_id) ← ingredients (id)
  → cooking_steps (recipe_id)
  → recipe_reviews (recipe_id)
  → recipe_cuisines (recipe_id) ← cuisines (id)
  → recipe_festivals (recipe_id) ← festivals_occasions (id)
  → recipe_variations (recipe_id) [linked as original or variation]
  → recipe_tags_relation (recipe_id) ← recipe_tags (id)
  → recipe_changelog (recipe_id)
  ← parent_recipe_id in recipes (self-join for variations)
  ← recipe_verification_history (recipe_id)
```

---

## 🎯 MIGRATION PHASES QUICK SUMMARY

| Phase | Action | Risk | Data Loss |
|-------|--------|------|-----------|
| 1 | Add columns to recipes table | LOW | No |
| 2 | Create users table | LOW | No |
| 3 | Create ingredients table | LOW | No |
| 4 | Create recipe_ingredients table | MEDIUM | No |
| 5 | Create cooking_steps table | MEDIUM | No |
| 6 | Create recipe_reviews table | LOW | No |
| 7 | Create recipe_variations table | LOW | No |
| 8 | Create verification_history table | LOW | No |
| 9 | Create cuisines table | LOW | No |
| 10 | Create recipe_cuisines table | LOW | No |
| 11 | Create festivals_occasions table | LOW | No |
| 12 | Create recipe_festivals table | LOW | No |
| 13 | Create geographic_coordinates table | LOW | No |
| 14 | Create recipe_tags table | LOW | No |
| 15 | Create recipe_tags_relation table | LOW | No |
| 16 | Create recipe_changelog table | LOW | No |

---

## 📊 INDEXING STRATEGY

### Must-Have Indexes (Performance Critical)
```sql
-- Foreign keys (always index)
CREATE INDEX idx_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_ingredient_id ON recipe_ingredients(ingredient_id);

-- Status/filtering
CREATE INDEX idx_status_published ON recipes(status, published_at DESC);
CREATE INDEX idx_authenticity_status ON recipes(authenticity_status);

-- Full-text search
FULLTEXT INDEX ft_recipe_search ON recipes(title, short_description, history);

-- Sorting
CREATE INDEX idx_community_rating ON recipes(community_rating DESC);
CREATE INDEX idx_created_at ON recipes(created_at DESC);

-- Unique lookups
CREATE UNIQUE INDEX idx_slug ON recipes(slug);
CREATE UNIQUE INDEX idx_username ON users(username);
```

### Nice-to-Have Indexes (Performance Optimization)
```sql
-- Common filter combinations
CREATE INDEX idx_country_cuisine ON recipes(country_code, cuisine_type);

-- Soft deletes
CREATE INDEX idx_soft_delete ON recipes(is_deleted, status);

-- Geographic queries
SPATIAL INDEX sp_coordinates ON geographic_coordinates(POINT(latitude, longitude));
```

---

## 🔍 SEARCH OPTIMIZATION

### Full-Text Query Examples
```sql
-- Boolean search
SELECT * FROM recipes WHERE MATCH(title, short_description, history)
AGAINST('+pasta -dairy' IN BOOLEAN MODE);

-- Natural language search
SELECT * FROM recipes WHERE MATCH(title, short_description, history)
AGAINST('authentic italian cooking' IN NATURAL LANGUAGE MODE);

-- With relevance ranking
SELECT *, MATCH(title, short_description, history)
AGAINST('pasta carbonara' IN BOOLEAN MODE) as relevance
FROM recipes
ORDER BY relevance DESC;
```

### Composite Filters
```sql
-- Multi-criteria query (uses multiple indexes efficiently)
SELECT * FROM recipes WHERE
  status = 'published'
  AND authenticity_status IN ('verified', 'community')
  AND country_code = 'IT'
  AND cuisine_type LIKE 'Italian%'
  AND total_time_minutes <= 45
  AND difficulty = 'Easy'
  AND community_rating >= 4.0
ORDER BY community_rating DESC
LIMIT 50;
```

---

## 🎯 RECOMMENDED USER ROLES & PERMISSIONS

```
viewer
  ├─ Browse recipes
  ├─ Read reviews
  └─ Search (limited)

contributor
  ├─ All viewer permissions
  ├─ Submit recipes (pending review)
  ├─ Write reviews
  └─ Add variations

moderator
  ├─ All contributor permissions
  ├─ Approve/reject recipes
  ├─ Flag inappropriate content
  └─ Suspend users

expert_curator
  ├─ All moderator permissions
  ├─ Verify recipe authenticity
  ├─ Add verification badges
  └─ Set authenticity_status

admin
  └─ Full access (everything)
```

---

## 💾 DATA RETENTION POLICIES

| Data | Retention | Notes |
|------|-----------|-------|
| Published recipes | Indefinite | Use soft delete (is_deleted=true) |
| Draft recipes | 1 year | Auto-delete after 1 year of inactivity |
| Deleted recipes | 5 years | Keep in DB for audit; hide from UI |
| User accounts | Indefinite | Deactivate, don't delete |
| Review history | 7 years | For compliance & analytics |
| Changelog entries | 10 years | Long-term audit trail |
| Verification logs | Indefinite | Transparency & compliance |

---

## 🔐 SECURITY CONSIDERATIONS

1. **SQL Injection Prevention**
   - Use prepared statements for all user input
   - Never concatenate user input into SQL queries

2. **Soft Deletes**
   - Always check `is_deleted = FALSE` in WHERE clauses
   - Use view: `recipes_published` for common queries

3. **Access Control**
   - Check `user.role` before allowing:
     - Recipe deletion: moderator+
     - Recipe verification: expert_curator+
     - Review deletion: moderator+

4. **Audit Trail**
   - Log all recipe modifications in changelog
   - Track who verified each recipe
   - Record all deletion timestamps

5. **Rating Manipulation**
   - Verify one review per user per recipe (unique constraint)
   - Flag suspicious review patterns
   - Validate authenticity_rating by verified curators

---

## 📱 API Response Mapping

### Recipe Card (List View)
```json
{
  "id": 42,
  "title": "Classic Pasta Carbonara",
  "slug": "classic-pasta-carbonara",
  "image": "...",
  "difficulty": "Medium",
  "time_minutes": 35,
  "cuisine": "Italian",
  "rating": 4.8,
  "reviews": 142,
  "verified": true
}
```

### Recipe Detail View
```json
{
  "id": 42,
  "title": "...",
  "slug": "...",
  "image": "...",
  "country": "Italy",
  "region": "Lazio",
  "cuisine": "Italian",
  "festival": "Christmas",
  "description": "...",
  "history": "...",
  "difficulty": "Medium",
  "prep_time": 15,
  "cook_time": 20,
  "servings": 4,
  "authenticity_status": "verified",
  "ingredients": [...],
  "steps": [...],
  "reviews": [...],
  "variations": [...]
}
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Test schema on staging environment
- [ ] Backup production database
- [ ] Run Phase 1 (alter recipes table)
- [ ] Verify existing queries still work
- [ ] Run Phases 2-16 (new tables)
- [ ] Populate master data (cuisines, festivals, tags)
- [ ] Update backend ORM models
- [ ] Update API endpoints
- [ ] Test all queries with sample data
- [ ] Update frontend UI
- [ ] Deploy to production
- [ ] Monitor query performance
- [ ] Archive old backups (keep 1 month)
- [ ] Document any custom migrations in wiki

---

**Schema Version**: 2.0  
**Last Updated**: December 2025  
**Compatibility**: Backward compatible with v1.0 recipes table  
**Scale**: 1M+ recipes, 100k+ users, 10M+ reviews
