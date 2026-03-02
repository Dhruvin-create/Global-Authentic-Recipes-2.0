-- Seed Data for Global Recipes
-- Compatible with current schema

-- First, get or create cuisines
INSERT INTO cuisines (id, name, slug, description, image, is_active) VALUES
('cuisine-italian', 'Italian', 'italian', 'Traditional Italian cuisine', 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400', TRUE),
('cuisine-japanese', 'Japanese', 'japanese', 'Authentic Japanese cuisine', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', TRUE),
('cuisine-indian', 'Indian', 'indian', 'Rich Indian flavors', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', TRUE),
('cuisine-mexican', 'Mexican', 'mexican', 'Vibrant Mexican dishes', 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400', TRUE),
('cuisine-american', 'American', 'american', 'Classic American food', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', TRUE),
('cuisine-thai', 'Thai', 'thai', 'Spicy Thai cuisine', 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400', TRUE),
('cuisine-greek', 'Greek', 'greek', 'Mediterranean Greek food', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', TRUE),
('cuisine-french', 'French', 'french', 'Elegant French cuisine', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Get a default author (Super Admin)
SET @author_id = (SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1);

-- If no super admin exists, use first admin or user
SET @author_id = IFNULL(@author_id, (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1));
SET @author_id = IFNULL(@author_id, (SELECT id FROM users LIMIT 1));

-- Insert recipes
INSERT INTO recipes 
(id, title, slug, description, image, category, cuisine_id, difficulty, prep_time, cook_time, servings, calories, is_published, is_featured, author_id)
VALUES

-- Recipe 1: Margherita Pizza
('recipe-001', 
'Margherita Pizza', 
'margherita-pizza',
'Classic Italian pizza with fresh mozzarella, basil, and tomato sauce. A timeless favorite that brings the authentic taste of Naples to your kitchen.',
'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
'MAIN_COURSE',
'cuisine-italian',
'EASY',
20, 15, 4, 285,
TRUE, TRUE, @author_id),

-- Recipe 2: Sushi Rolls
('recipe-002',
'Sushi Rolls',
'sushi-rolls',
'Traditional sushi rolls with rice, nori, and fresh vegetables or fish. Perfect for a healthy and delicious meal.',
'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
'MAIN_COURSE',
'cuisine-japanese',
'MEDIUM',
30, 10, 4, 200,
TRUE, TRUE, @author_id),

-- Recipe 3: Paneer Butter Masala
('recipe-003',
'Paneer Butter Masala',
'paneer-butter-masala',
'Creamy North Indian curry made with paneer cubes in rich tomato gravy. A vegetarian delight that melts in your mouth.',
'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
'MAIN_COURSE',
'cuisine-indian',
'MEDIUM',
15, 25, 4, 350,
TRUE, TRUE, @author_id),

-- Recipe 4: Tacos Al Pastor
('recipe-004',
'Tacos Al Pastor',
'tacos-al-pastor',
'Mexican street-style tacos with marinated pork and pineapple. Bursting with authentic flavors and spices.',
'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
'MAIN_COURSE',
'cuisine-mexican',
'HARD',
60, 20, 4, 400,
TRUE, TRUE, @author_id),

-- Recipe 5: Chocolate Brownies
('recipe-005',
'Chocolate Brownies',
'chocolate-brownies',
'Rich and fudgy chocolate brownies with crispy top. Perfect dessert for chocolate lovers.',
'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800&q=80',
'DESSERT',
'cuisine-american',
'EASY',
15, 25, 6, 450,
TRUE, FALSE, @author_id),

-- Recipe 6: Pad Thai
('recipe-006',
'Pad Thai',
'pad-thai',
'Famous Thai stir-fried noodles with tamarind sauce. A perfect balance of sweet, sour, and savory flavors.',
'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80',
'MAIN_COURSE',
'cuisine-thai',
'MEDIUM',
20, 15, 4, 330,
TRUE, FALSE, @author_id),

-- Recipe 7: Greek Salad
('recipe-007',
'Greek Salad',
'greek-salad',
'Fresh Mediterranean salad with feta cheese and olives. Light, healthy, and full of flavor.',
'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
'APPETIZER',
'cuisine-greek',
'EASY',
10, 0, 2, 180,
TRUE, FALSE, @author_id),

-- Recipe 8: Croissants
('recipe-008',
'Croissants',
'croissants',
'Flaky buttery French pastry perfect for breakfast. A labor of love that rewards with incredible taste.',
'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
'BREAKFAST',
'cuisine-french',
'HARD',
120, 20, 6, 300,
TRUE, FALSE, @author_id);

-- Insert ingredients for each recipe
INSERT INTO ingredients (id, recipe_id, name, quantity, display_order) VALUES
-- Margherita Pizza
('ing-001-01', 'recipe-001', 'Pizza dough', '1 ball', 1),
('ing-001-02', 'recipe-001', 'Tomato sauce', '1/2 cup', 2),
('ing-001-03', 'recipe-001', 'Fresh mozzarella', '200g', 3),
('ing-001-04', 'recipe-001', 'Fresh basil leaves', '10 leaves', 4),
('ing-001-05', 'recipe-001', 'Olive oil', '2 tbsp', 5),
('ing-001-06', 'recipe-001', 'Salt', '1 tsp', 6),

-- Sushi Rolls
('ing-002-01', 'recipe-002', 'Sushi rice', '2 cups', 1),
('ing-002-02', 'recipe-002', 'Nori sheets', '4 sheets', 2),
('ing-002-03', 'recipe-002', 'Cucumber', '1 piece', 3),
('ing-002-04', 'recipe-002', 'Avocado', '1 piece', 4),
('ing-002-05', 'recipe-002', 'Carrot', '1 piece', 5),
('ing-002-06', 'recipe-002', 'Salmon', '200g', 6),
('ing-002-07', 'recipe-002', 'Soy sauce', '1/4 cup', 7),

-- Paneer Butter Masala
('ing-003-01', 'recipe-003', 'Paneer', '400g', 1),
('ing-003-02', 'recipe-003', 'Tomato puree', '2 cups', 2),
('ing-003-03', 'recipe-003', 'Butter', '3 tbsp', 3),
('ing-003-04', 'recipe-003', 'Heavy cream', '1/2 cup', 4),
('ing-003-05', 'recipe-003', 'Onion', '2 pieces', 5),
('ing-003-06', 'recipe-003', 'Garlic', '6 cloves', 6),
('ing-003-07', 'recipe-003', 'Garam masala', '1 tsp', 7),

-- Tacos Al Pastor
('ing-004-01', 'recipe-004', 'Pork shoulder', '1kg', 1),
('ing-004-02', 'recipe-004', 'Pineapple', '1 piece', 2),
('ing-004-03', 'recipe-004', 'Corn tortillas', '12 pieces', 3),
('ing-004-04', 'recipe-004', 'Onion', '1 piece', 4),
('ing-004-05', 'recipe-004', 'Cilantro', '1 bunch', 5),
('ing-004-06', 'recipe-004', 'Chili paste', '3 tbsp', 6);

-- Insert instructions for each recipe
INSERT INTO instructions (id, recipe_id, step_number, description) VALUES
-- Margherita Pizza
('inst-001-01', 'recipe-001', 1, 'Preheat oven to 250°C (480°F).'),
('inst-001-02', 'recipe-001', 2, 'Roll out pizza dough on a floured surface.'),
('inst-001-03', 'recipe-001', 3, 'Spread tomato sauce evenly over the dough.'),
('inst-001-04', 'recipe-001', 4, 'Add fresh mozzarella pieces on top.'),
('inst-001-05', 'recipe-001', 5, 'Bake for 10-12 minutes until crust is golden.'),
('inst-001-06', 'recipe-001', 6, 'Garnish with fresh basil and drizzle olive oil.'),

-- Sushi Rolls
('inst-002-01', 'recipe-002', 1, 'Prepare sushi rice according to package instructions.'),
('inst-002-02', 'recipe-002', 2, 'Place nori sheet on bamboo mat.'),
('inst-002-03', 'recipe-002', 3, 'Spread rice evenly on nori, leaving 1 inch at top.'),
('inst-002-04', 'recipe-002', 4, 'Add cucumber, avocado, carrot, and salmon in a line.'),
('inst-002-05', 'recipe-002', 5, 'Roll tightly using the bamboo mat.'),
('inst-002-06', 'recipe-002', 6, 'Slice into 8 pieces and serve with soy sauce.'),

-- Paneer Butter Masala
('inst-003-01', 'recipe-003', 1, 'Sauté onions and garlic in butter until golden.'),
('inst-003-02', 'recipe-003', 2, 'Add tomato puree and spices, cook until thick.'),
('inst-003-03', 'recipe-003', 3, 'Add paneer cubes and mix gently.'),
('inst-003-04', 'recipe-003', 4, 'Pour in cream and simmer for 10 minutes.'),
('inst-003-05', 'recipe-003', 5, 'Garnish with cream and serve hot.'),

-- Tacos Al Pastor
('inst-004-01', 'recipe-004', 1, 'Marinate pork with chili paste and spices for 2 hours.'),
('inst-004-02', 'recipe-004', 2, 'Grill pork with pineapple slices until cooked.'),
('inst-004-03', 'recipe-004', 3, 'Slice pork and pineapple thinly.'),
('inst-004-04', 'recipe-004', 4, 'Warm tortillas on griddle.'),
('inst-004-05', 'recipe-004', 5, 'Assemble tacos with pork, pineapple, onion, and cilantro.');

-- Initialize recipe stats
INSERT INTO recipe_stats (id, like_count, favorite_count, review_count, avg_rating) VALUES
('recipe-001', 0, 0, 0, 0),
('recipe-002', 0, 0, 0, 0),
('recipe-003', 0, 0, 0, 0),
('recipe-004', 0, 0, 0, 0),
('recipe-005', 0, 0, 0, 0),
('recipe-006', 0, 0, 0, 0),
('recipe-007', 0, 0, 0, 0),
('recipe-008', 0, 0, 0, 0);

-- Success message
SELECT 'Seed data imported successfully!' as message;
SELECT COUNT(*) as total_recipes FROM recipes;
