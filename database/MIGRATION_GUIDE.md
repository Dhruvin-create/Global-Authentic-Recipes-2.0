# 🔄 Cuisine Table Migration Guide

## 📋 Quick Steps

### Step 1: Backup Your Database
```sql
-- In HeidiSQL: Tools → Export Database as SQL
-- Or in phpMyAdmin: Export → SQL format
```

### Step 2: Run Migration
1. Open **HeidiSQL** or **phpMyAdmin**
2. Open file: `database/migration-add-cuisines.sql`
3. Execute the entire script
4. Wait for completion (should take 1-2 minutes)

### Step 3: Verify Migration
1. Open file: `database/verify-migration.sql`
2. Execute and check all results
3. Ensure no errors and all counts look correct

---

## 🎯 What This Migration Does

### ✅ **Creates:**
- New `cuisines` table with 10+ popular cuisines
- Adds `cuisine_id` column to `recipes` table
- Creates foreign key relationship
- Updates all analytics views

### ✅ **Updates:**
- Maps existing recipe cuisines to new cuisine IDs
- Preserves all your existing data
- Improves database performance with proper indexing

### ✅ **Maintains:**
- All existing recipes, users, reviews, likes, favorites
- All relationships and data integrity
- Backward compatibility (old cuisine column kept as backup)

---

## 🔍 Before & After

### Before Migration:
```sql
recipes table:
- cuisine VARCHAR(100)  -- "Indian", "Italian", etc.
```

### After Migration:
```sql
cuisines table:
- id, name, slug, description, image, is_active

recipes table:
- cuisine_id VARCHAR(36)  -- Foreign key to cuisines.id
- cuisine VARCHAR(100)    -- Kept as backup (optional to remove)
```

---

## 🚨 If Something Goes Wrong

### Option 1: Check Error Messages
- Look for specific error in HeidiSQL/phpMyAdmin
- Most common: foreign key constraint issues
- Solution: Run verification queries to identify problem

### Option 2: Rollback (Emergency Only)
```sql
-- Run this file if you need to completely revert:
source database/rollback-cuisines.sql
```

### Option 3: Manual Fix
```sql
-- Check unmapped recipes:
SELECT id, title, cuisine FROM recipes WHERE cuisine_id IS NULL;

-- Manually map them:
UPDATE recipes SET cuisine_id = (SELECT id FROM cuisines WHERE name = 'Other') 
WHERE cuisine_id IS NULL;
```

---

## 📊 Expected Results

After successful migration:

### Cuisines Table:
```
+----------+---------------+--------+
| name     | recipe_count  | active |
+----------+---------------+--------+
| Indian   | 5             | 1      |
| Italian  | 3             | 1      |
| Chinese  | 2             | 1      |
| Other    | 1             | 1      |
+----------+---------------+--------+
```

### Recipe Stats with Cuisine:
```
+------------------+-------------+------------+
| title            | cuisine     | avg_rating |
+------------------+-------------+------------+
| Butter Chicken   | Indian      | 4.5        |
| Pasta Carbonara  | Italian     | 4.2        |
+------------------+-------------+------------+
```

---

## 🎉 Benefits After Migration

### For Frontend:
- Browse recipes by cuisine
- Filter by cuisine type
- Show cuisine statistics
- Cuisine-specific pages

### For Admin Panel:
- Manage cuisine categories
- Add/edit cuisine info
- Enable/disable cuisines
- View cuisine analytics

### For Performance:
- Faster cuisine-based queries
- Better database normalization
- Indexed lookups
- Consistent data

---

## 🔧 Troubleshooting

### Error: "Duplicate entry for key 'name'"
**Solution**: Some cuisine already exists, skip that INSERT

### Error: "Cannot add foreign key constraint"
**Solution**: Some recipes have invalid cuisine_id, run verification

### Error: "Column 'cuisine_id' cannot be null"
**Solution**: Some recipes not mapped, run the unmapped recipes fix

### Error: "Table 'cuisines' already exists"
**Solution**: Migration already run, skip to verification

---

## ✅ Final Checklist

- [ ] Database backed up
- [ ] Migration script executed successfully
- [ ] Verification script shows all green ✅
- [ ] Sample queries work correctly
- [ ] No unmapped recipes (count = 0)
- [ ] Foreign key constraint active
- [ ] Views updated with cuisine support

---

**Migration Complete! Your database now has proper cuisine management! 🎉**