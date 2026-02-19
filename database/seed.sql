-- ============================================
-- Seed Data for Global Authentic Recipes
-- ============================================

USE global_recipes;

-- ============================================
-- SEED USERS (Admin & Normal User)
-- Password for both: "password123" (hashed with bcrypt)
-- ============================================

INSERT INTO users (id, email, phone, password, name, role, auth_provider, is_verified, created_at) VALUES
-- Admin User (Email Auth)
(
    UUID(),
    'admin@recipes.com',
    NULL,
    '$2a$10$uau4TzuAAlRo2BinYRg2nOb3dVuHUrHQNuIPuF4dVsTx5mu.WSVtG', -- password123
    'Admin User',
    'ADMIN',
    'EMAIL',
    TRUE,
    NOW()
),

-- Normal User (Email Auth)
(
    UUID(),
    'user@example.com',
    NULL,
    '$2a$10$uau4TzuAAlRo2BinYRg2nOb3dVuHUrHQNuIPuF4dVsTx5mu.WSVtG', -- password123
    'John Doe',
    'USER',
    'EMAIL',
    TRUE,
    NOW()
),

-- Normal User (Phone Auth)
(
    UUID(),
    NULL,
    '+919876543210',
    '$2a$10$uau4TzuAAlRo2BinYRg2nOb3dVuHUrHQNuIPuF4dVsTx5mu.WSVtG', -- password123
    'Rahul Kumar',
    'USER',
    'PHONE',
    TRUE,
    NOW()
);

-- ============================================
-- SEED CUISINES
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
-- SEED TAGS
-- ============================================

INSERT INTO tags (id, name, slug) VALUES
(UUID(), 'Vegetarian', 'vegetarian'),
(UUID(), 'Vegan', 'vegan'),
(UUID(), 'Gluten-Free', 'gluten-free'),
(UUID(), 'Quick & Easy', 'quick-easy'),
(UUID(), 'Healthy', 'healthy'),
(UUID(), 'Spicy', 'spicy'),
(UUID(), 'Low-Carb', 'low-carb'),
(UUID(), 'High-Protein', 'high-protein'),
(UUID(), 'Comfort Food', 'comfort-food'),
(UUID(), 'Traditional', 'traditional');

-- ============================================
-- SAMPLE RECIPE (Created by Admin)
-- ============================================

-- Get admin user ID and Indian cuisine ID
SET @admin_id = (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1);
SET @indian_cuisine_id = (SELECT id FROM cuisines WHERE slug = 'indian' LIMIT 1);
SET @recipe_id = UUID();

INSERT INTO recipes (
    id, title, slug, description, image, 
    category, cuisine_id, difficulty, prep_time, cook_time, servings, calories,
    is_published, is_featured, author_id, published_at
) VALUES (
    @recipe_id,
    'Classic Butter Chicken',
    'classic-butter-chicken',
    'Authentic Indian butter chicken with rich, creamy tomato gravy. This restaurant-style recipe is perfect for special occasions and family dinners.',
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
    'MAIN_COURSE',
    @indian_cuisine_id,
    'MEDIUM',
    30,
    45,
    4,
    450,
    TRUE,
    TRUE,
    @admin_id,
    NOW()
);

-- Add Ingredients
INSERT INTO ingredients (id, recipe_id, name, quantity, display_order) VALUES
(UUID(), @recipe_id, 'Chicken breast', '500g, boneless', 1),
(UUID(), @recipe_id, 'Yogurt', '1/2 cup', 2),
(UUID(), @recipe_id, 'Butter', '4 tablespoons', 3),
(UUID(), @recipe_id, 'Tomato puree', '2 cups', 4),
(UUID(), @recipe_id, 'Heavy cream', '1/2 cup', 5),
(UUID(), @recipe_id, 'Ginger-garlic paste', '2 tablespoons', 6),
(UUID(), @recipe_id, 'Garam masala', '1 teaspoon', 7),
(UUID(), @recipe_id, 'Kashmiri red chili powder', '1 teaspoon', 8),
(UUID(), @recipe_id, 'Salt', 'to taste', 9),
(UUID(), @recipe_id, 'Fresh coriander', 'for garnish', 10);

-- Add Instructions
INSERT INTO instructions (id, recipe_id, step_number, description) VALUES
(UUID(), @recipe_id, 1, 'Marinate chicken pieces with yogurt, ginger-garlic paste, and salt for 30 minutes.'),
(UUID(), @recipe_id, 2, 'Heat 2 tablespoons butter in a pan and cook marinated chicken until golden brown. Set aside.'),
(UUID(), @recipe_id, 3, 'In the same pan, add remaining butter and sauté ginger-garlic paste until fragrant.'),
(UUID(), @recipe_id, 4, 'Add tomato puree, red chili powder, and garam masala. Cook for 10 minutes.'),
(UUID(), @recipe_id, 5, 'Add cooked chicken pieces and simmer for 5 minutes.'),
(UUID(), @recipe_id, 6, 'Pour in heavy cream and mix well. Cook for another 5 minutes.'),
(UUID(), @recipe_id, 7, 'Garnish with fresh coriander and serve hot with naan or rice.');

-- Add Tags to Recipe
INSERT INTO recipe_tags (recipe_id, tag_id)
SELECT @recipe_id, id FROM tags WHERE slug IN ('traditional', 'spicy', 'comfort-food');

-- ============================================
-- SAMPLE USER INTERACTIONS
-- ============================================

-- Get normal user ID
SET @user_id = (SELECT id FROM users WHERE role = 'USER' AND email IS NOT NULL LIMIT 1);

-- User likes the recipe
INSERT INTO likes (id, user_id, recipe_id) VALUES
(UUID(), @user_id, @recipe_id);

-- User adds to favorites
INSERT INTO favorites (id, user_id, recipe_id) VALUES
(UUID(), @user_id, @recipe_id);

-- User writes a review
SET @review_id = UUID();
INSERT INTO reviews (id, user_id, recipe_id, rating, comment) VALUES
(@review_id, @user_id, @recipe_id, 5, 'Absolutely delicious! The butter chicken turned out perfect. My family loved it!');

-- Admin replies to review
INSERT INTO review_replies (id, review_id, admin_id, comment) VALUES
(UUID(), @review_id, @admin_id, 'Thank you so much! We are glad you enjoyed the recipe. Happy cooking!');

-- User creates a playlist
SET @playlist_id = UUID();
INSERT INTO playlists (id, user_id, name, description, is_public) VALUES
(@playlist_id, @user_id, 'My Favorite Indian Recipes', 'Collection of authentic Indian dishes I love to cook', TRUE);

-- Add recipe to playlist
INSERT INTO playlist_items (id, playlist_id, recipe_id, display_order) VALUES
(UUID(), @playlist_id, @recipe_id, 1);

-- ============================================
-- VERIFICATION
-- ============================================

-- Show created data
SELECT 'Users Created:' as Info;
SELECT id, email, phone, name, role, auth_provider FROM users;

SELECT '\nCuisines Created:' as Info;
SELECT id, name, slug, is_active FROM cuisines;

SELECT '\nRecipes Created:' as Info;
SELECT r.id, r.title, r.category, c.name as cuisine, r.difficulty, r.is_published 
FROM recipes r 
JOIN cuisines c ON r.cuisine_id = c.id;

SELECT '\nUser Activity:' as Info;
SELECT * FROM user_activity;

SELECT '\nCuisine Statistics:' as Info;
SELECT * FROM cuisine_stats;

SELECT '\nRecipe Statistics:' as Info;
SELECT * FROM recipe_stats;
