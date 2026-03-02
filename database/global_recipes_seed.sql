
-- Seed Data for Global Recipes

INSERT INTO recipes 
(id, name, category, cuisine, description, ingredients, steps, prep_time, cook_time, total_time, difficulty, calories, servings, is_vegetarian, is_vegan, image_url, tags)
VALUES

(1, 'Margherita Pizza', 'Main Course', 'Italian',
'Classic Italian pizza with fresh mozzarella, basil, and tomato sauce.',
'Pizza dough; Tomato sauce; Fresh mozzarella; Basil leaves; Olive oil; Salt',
'1. Preheat oven to 250C. 2. Roll out dough. 3. Spread sauce. 4. Add mozzarella. 5. Bake 10-12 mins. 6. Garnish with basil and olive oil.',
20, 15, 35, 'Easy', 285, 4, TRUE, FALSE,
'https://example.com/images/margherita.jpg',
'pizza, italian, vegetarian, popular'),

(2, 'Sushi Rolls', 'Main Course', 'Japanese',
'Traditional sushi rolls with rice, nori, and fresh vegetables or fish.',
'Sushi rice; Nori sheets; Cucumber; Avocado; Carrot; Salmon; Soy sauce',
'1. Prepare sushi rice. 2. Place nori on mat. 3. Spread rice. 4. Add fillings. 5. Roll tightly. 6. Slice and serve.',
30, 10, 40, 'Medium', 200, 4, FALSE, FALSE,
'https://example.com/images/sushi.jpg',
'sushi, japanese, seafood, trending'),

(3, 'Paneer Butter Masala', 'Main Course', 'Indian',
'Creamy North Indian curry made with paneer cubes in rich tomato gravy.',
'Paneer; Tomato puree; Butter; Cream; Onion; Garlic; Garam masala; Spices',
'1. Saute onions & garlic. 2. Add tomato puree & spices. 3. Cook till thick. 4. Add paneer & cream. 5. Simmer 10 mins.',
15, 25, 40, 'Medium', 350, 4, TRUE, FALSE,
'https://example.com/images/paneer-butter-masala.jpg',
'indian, curry, paneer, vegetarian, creamy'),

(4, 'Tacos Al Pastor', 'Main Course', 'Mexican',
'Mexican street-style tacos with marinated pork and pineapple.',
'Pork; Pineapple; Corn tortillas; Onion; Cilantro; Chili paste; Spices',
'1. Marinate pork. 2. Grill with pineapple. 3. Slice thinly. 4. Assemble in tortillas. 5. Garnish & serve.',
60, 20, 80, 'Hard', 400, 4, FALSE, FALSE,
'https://example.com/images/tacos.jpg',
'mexican, street-food, spicy, meat'),

(5, 'Chocolate Brownies', 'Dessert', 'American',
'Rich and fudgy chocolate brownies with crispy top.',
'Dark chocolate; Butter; Sugar; Eggs; Flour; Cocoa powder',
'1. Melt chocolate & butter. 2. Mix sugar & eggs. 3. Combine all. 4. Bake at 180C for 25 mins. 5. Cool and slice.',
15, 25, 40, 'Easy', 450, 6, TRUE, FALSE,
'https://example.com/images/brownies.jpg',
'dessert, chocolate, sweet, bakery'),

(6, 'Pad Thai', 'Main Course', 'Thai',
'Famous Thai stir-fried noodles with tamarind sauce.',
'Rice noodles; Tofu; Shrimp; Egg; Tamarind paste; Bean sprouts; Peanuts',
'1. Soak noodles. 2. Stir fry tofu & shrimp. 3. Add egg. 4. Add noodles & sauce. 5. Toss with sprouts & peanuts.',
20, 15, 35, 'Medium', 330, 4, FALSE, FALSE,
'https://example.com/images/padthai.jpg',
'thai, noodles, street-food, popular'),

(7, 'Greek Salad', 'Appetizer', 'Greek',
'Fresh Mediterranean salad with feta cheese and olives.',
'Tomato; Cucumber; Red onion; Feta cheese; Olives; Olive oil; Oregano',
'1. Chop vegetables. 2. Mix in bowl. 3. Add feta & olives. 4. Drizzle olive oil & oregano.',
10, 0, 10, 'Easy', 180, 2, TRUE, FALSE,
'https://example.com/images/greek-salad.jpg',
'salad, healthy, mediterranean, vegetarian'),

(8, 'Croissants', 'Breakfast', 'French',
'Flaky buttery French pastry perfect for breakfast.',
'Flour; Butter; Yeast; Milk; Sugar; Salt',
'1. Prepare dough. 2. Layer butter. 3. Fold & roll multiple times. 4. Shape croissants. 5. Bake till golden.',
120, 20, 140, 'Hard', 300, 6, TRUE, FALSE,
'https://example.com/images/croissant.jpg',
'french, bakery, breakfast, pastry');

