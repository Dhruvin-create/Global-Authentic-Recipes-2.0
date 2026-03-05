import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'switchback.proxy.rlwy.net',
  port: 20721,
  user: 'root',
  password: 'wBYdYMSqohVekErTKnqknEFScPkhkrEc',
  database: 'railway'
};

const recipeDetails = {
  'margherita-pizza': {
    ingredients: [
      { name: 'Pizza dough', quantity: '1 ball (400g)', order: 1 },
      { name: 'Tomato sauce', quantity: '1/2 cup', order: 2 },
      { name: 'Fresh mozzarella cheese', quantity: '200g, sliced', order: 3 },
      { name: 'Fresh basil leaves', quantity: '10-12 leaves', order: 4 },
      { name: 'Extra virgin olive oil', quantity: '2 tablespoons', order: 5 },
      { name: 'Salt', quantity: 'To taste', order: 6 }
    ],
    instructions: [
      { step: 1, description: 'Preheat your oven to 250°C (480°F). If you have a pizza stone, place it in the oven to heat up.' },
      { step: 2, description: 'Roll out the pizza dough on a floured surface to about 12 inches in diameter. Transfer to a pizza peel or baking sheet.' },
      { step: 3, description: 'Spread the tomato sauce evenly over the dough, leaving a 1-inch border for the crust.' },
      { step: 4, description: 'Arrange the mozzarella slices evenly over the sauce. Season with a pinch of salt.' },
      { step: 5, description: 'Bake in the preheated oven for 10-12 minutes, until the crust is golden and the cheese is bubbling.' },
      { step: 6, description: 'Remove from oven, immediately top with fresh basil leaves and drizzle with olive oil. Slice and serve hot.' }
    ]
  },
  'sushi-rolls': {
    ingredients: [
      { name: 'Sushi rice', quantity: '2 cups, cooked', order: 1 },
      { name: 'Nori sheets', quantity: '4 sheets', order: 2 },
      { name: 'Cucumber', quantity: '1, julienned', order: 3 },
      { name: 'Avocado', quantity: '1, sliced', order: 4 },
      { name: 'Carrot', quantity: '1, julienned', order: 5 },
      { name: 'Fresh salmon', quantity: '200g, sliced', order: 6 },
      { name: 'Soy sauce', quantity: 'For serving', order: 7 },
      { name: 'Wasabi', quantity: 'For serving', order: 8 }
    ],
    instructions: [
      { step: 1, description: 'Prepare sushi rice according to package instructions and let it cool to room temperature. Season with rice vinegar, sugar, and salt.' },
      { step: 2, description: 'Place a nori sheet on a bamboo sushi mat, shiny side down. Wet your hands and spread a thin layer of rice over the nori, leaving 1 inch at the top.' },
      { step: 3, description: 'Arrange cucumber, avocado, carrot, and salmon in a line across the center of the rice.' },
      { step: 4, description: 'Using the bamboo mat, roll the sushi tightly from bottom to top, applying gentle pressure to keep it compact.' },
      { step: 5, description: 'Wet a sharp knife and slice the roll into 6-8 pieces, cleaning the knife between cuts.' },
      { step: 6, description: 'Serve immediately with soy sauce, wasabi, and pickled ginger.' }
    ]
  },
  'paneer-butter-masala': {
    ingredients: [
      { name: 'Paneer (cottage cheese)', quantity: '400g, cubed', order: 1 },
      { name: 'Tomato puree', quantity: '2 cups', order: 2 },
      { name: 'Butter', quantity: '4 tablespoons', order: 3 },
      { name: 'Heavy cream', quantity: '1/2 cup', order: 4 },
      { name: 'Onion', quantity: '2 large, finely chopped', order: 5 },
      { name: 'Garlic paste', quantity: '1 tablespoon', order: 6 },
      { name: 'Ginger paste', quantity: '1 tablespoon', order: 7 },
      { name: 'Garam masala', quantity: '1 teaspoon', order: 8 },
      { name: 'Kashmiri red chili powder', quantity: '1 teaspoon', order: 9 },
      { name: 'Kasuri methi (dried fenugreek)', quantity: '1 tablespoon', order: 10 }
    ],
    instructions: [
      { step: 1, description: 'Heat 2 tablespoons butter in a pan. Sauté onions until golden brown, then add ginger-garlic paste and cook for 2 minutes.' },
      { step: 2, description: 'Add tomato puree, red chili powder, and salt. Cook on medium heat for 10-12 minutes until the mixture thickens and oil separates.' },
      { step: 3, description: 'Add garam masala and kasuri methi. Mix well and cook for another 2 minutes.' },
      { step: 4, description: 'Add the paneer cubes and remaining butter. Gently mix to coat the paneer with the gravy.' },
      { step: 5, description: 'Pour in the cream and simmer for 5-7 minutes on low heat, stirring occasionally.' },
      { step: 6, description: 'Garnish with fresh cream and serve hot with naan or rice.' }
    ]
  },
  'tacos-al-pastor': {
    ingredients: [
      { name: 'Pork shoulder', quantity: '1 kg, thinly sliced', order: 1 },
      { name: 'Fresh pineapple', quantity: '1 cup, diced', order: 2 },
      { name: 'Corn tortillas', quantity: '12 small', order: 3 },
      { name: 'White onion', quantity: '1, finely chopped', order: 4 },
      { name: 'Fresh cilantro', quantity: '1/2 cup, chopped', order: 5 },
      { name: 'Dried guajillo chilies', quantity: '4, rehydrated', order: 6 },
      { name: 'Achiote paste', quantity: '2 tablespoons', order: 7 },
      { name: 'Lime', quantity: '2, cut into wedges', order: 8 }
    ],
    instructions: [
      { step: 1, description: 'Blend rehydrated guajillo chilies, achiote paste, garlic, vinegar, and spices to make marinade. Marinate pork for at least 4 hours or overnight.' },
      { step: 2, description: 'Thread marinated pork onto a vertical spit or grill on high heat, adding pineapple slices on top.' },
      { step: 3, description: 'Cook the pork, rotating occasionally, until edges are crispy and caramelized (about 15-20 minutes).' },
      { step: 4, description: 'Thinly slice the cooked pork and pineapple from the spit.' },
      { step: 5, description: 'Warm the corn tortillas on a griddle or directly over flame.' },
      { step: 6, description: 'Assemble tacos with pork, pineapple, onion, and cilantro. Serve with lime wedges and your favorite salsa.' }
    ]
  },
  'chocolate-brownies': {
    ingredients: [
      { name: 'Dark chocolate', quantity: '200g, chopped', order: 1 },
      { name: 'Unsalted butter', quantity: '150g', order: 2 },
      { name: 'Granulated sugar', quantity: '1 cup', order: 3 },
      { name: 'Large eggs', quantity: '3', order: 4 },
      { name: 'All-purpose flour', quantity: '3/4 cup', order: 5 },
      { name: 'Cocoa powder', quantity: '1/4 cup', order: 6 },
      { name: 'Vanilla extract', quantity: '1 teaspoon', order: 7 },
      { name: 'Salt', quantity: '1/4 teaspoon', order: 8 }
    ],
    instructions: [
      { step: 1, description: 'Preheat oven to 180°C (350°F). Line a 9x9 inch baking pan with parchment paper.' },
      { step: 2, description: 'Melt chocolate and butter together in a double boiler or microwave, stirring until smooth. Let cool slightly.' },
      { step: 3, description: 'In a large bowl, whisk together sugar and eggs until light and fluffy. Add vanilla extract.' },
      { step: 4, description: 'Pour the melted chocolate mixture into the egg mixture and fold gently until combined.' },
      { step: 5, description: 'Sift in flour, cocoa powder, and salt. Fold until just combined - do not overmix.' },
      { step: 6, description: 'Pour batter into prepared pan and bake for 25-30 minutes. The center should be slightly fudgy. Cool completely before cutting into squares.' }
    ]
  },
  'pad-thai': {
    ingredients: [
      { name: 'Rice noodles', quantity: '200g, dried', order: 1 },
      { name: 'Firm tofu', quantity: '200g, cubed', order: 2 },
      { name: 'Shrimp', quantity: '200g, peeled', order: 3 },
      { name: 'Eggs', quantity: '2', order: 4 },
      { name: 'Tamarind paste', quantity: '3 tablespoons', order: 5 },
      { name: 'Fish sauce', quantity: '2 tablespoons', order: 6 },
      { name: 'Bean sprouts', quantity: '1 cup', order: 7 },
      { name: 'Roasted peanuts', quantity: '1/4 cup, crushed', order: 8 },
      { name: 'Green onions', quantity: '2, chopped', order: 9 }
    ],
    instructions: [
      { step: 1, description: 'Soak rice noodles in warm water for 20-30 minutes until soft. Drain and set aside.' },
      { step: 2, description: 'Heat oil in a wok over high heat. Stir-fry tofu until golden, then add shrimp and cook until pink. Remove and set aside.' },
      { step: 3, description: 'In the same wok, scramble the eggs. Add the drained noodles and stir-fry for 2 minutes.' },
      { step: 4, description: 'Add tamarind paste, fish sauce, and palm sugar. Toss everything together until well combined.' },
      { step: 5, description: 'Return tofu and shrimp to the wok. Add bean sprouts and green onions. Toss for 1-2 minutes.' },
      { step: 6, description: 'Serve immediately, garnished with crushed peanuts, lime wedges, and extra bean sprouts.' }
    ]
  },
  'croissants': {
    ingredients: [
      { name: 'All-purpose flour', quantity: '4 cups', order: 1 },
      { name: 'Cold butter', quantity: '300g, for laminating', order: 2 },
      { name: 'Active dry yeast', quantity: '2 teaspoons', order: 3 },
      { name: 'Whole milk', quantity: '1 cup, warm', order: 4 },
      { name: 'Granulated sugar', quantity: '1/4 cup', order: 5 },
      { name: 'Salt', quantity: '1 teaspoon', order: 6 },
      { name: 'Egg', quantity: '1, for egg wash', order: 7 }
    ],
    instructions: [
      { step: 1, description: 'Mix flour, yeast, sugar, and salt. Add warm milk and knead into a smooth dough. Refrigerate for 1 hour.' },
      { step: 2, description: 'Roll out dough into a rectangle. Place cold butter in the center and fold dough over it like an envelope.' },
      { step: 3, description: 'Roll out the dough and fold into thirds (letter fold). Refrigerate for 30 minutes. Repeat this process 3 more times.' },
      { step: 4, description: 'Roll out the laminated dough to 1/4 inch thickness. Cut into triangles.' },
      { step: 5, description: 'Roll each triangle from the wide end to the point to form croissant shape. Place on baking sheet and let rise for 2 hours.' },
      { step: 6, description: 'Brush with egg wash and bake at 200°C (400°F) for 15-20 minutes until golden brown and flaky.' }
    ]
  },
  'kung-pao-chicken': {
    ingredients: [
      { name: 'Chicken breast', quantity: '500g, cubed', order: 1 },
      { name: 'Roasted peanuts', quantity: '1/2 cup', order: 2 },
      { name: 'Dried red chilies', quantity: '8-10', order: 3 },
      { name: 'Bell peppers', quantity: '2, diced', order: 4 },
      { name: 'Soy sauce', quantity: '3 tablespoons', order: 5 },
      { name: 'Rice vinegar', quantity: '2 tablespoons', order: 6 },
      { name: 'Cornstarch', quantity: '1 tablespoon', order: 7 },
      { name: 'Ginger-garlic paste', quantity: '1 tablespoon', order: 8 },
      { name: 'Green onions', quantity: '3, chopped', order: 9 }
    ],
    instructions: [
      { step: 1, description: 'Marinate chicken with soy sauce, cornstarch, and a pinch of salt for 15 minutes.' },
      { step: 2, description: 'Heat oil in a wok over high heat. Stir-fry dried chilies until fragrant, about 30 seconds.' },
      { step: 3, description: 'Add marinated chicken and stir-fry until cooked through and slightly crispy, about 5-6 minutes.' },
      { step: 4, description: 'Add bell peppers, ginger-garlic paste, and stir-fry for 2 minutes.' },
      { step: 5, description: 'Pour in the sauce mixture (soy sauce, rice vinegar, sugar) and toss everything together.' },
      { step: 6, description: 'Add roasted peanuts and green onions. Toss for 1 minute and serve hot with steamed rice.' }
    ]
  }
};

async function updateRecipeDetails() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔄 Updating recipe details with proper ingredients and instructions...\n');

    // Get all recipes
    const [recipes] = await connection.execute('SELECT id, slug FROM recipes');
    
    for (const recipe of recipes) {
      const details = recipeDetails[recipe.slug];
      
      if (!details) {
        console.log(`⚠️  No details found for: ${recipe.slug}`);
        continue;
      }
      
      console.log(`📝 Updating: ${recipe.slug}`);
      
      // Delete old ingredients and instructions
      await connection.execute('DELETE FROM ingredients WHERE recipe_id = ?', [recipe.id]);
      await connection.execute('DELETE FROM instructions WHERE recipe_id = ?', [recipe.id]);
      
      // Insert new ingredients
      for (const ingredient of details.ingredients) {
        await connection.execute(
          'INSERT INTO ingredients (recipe_id, name, quantity, display_order) VALUES (?, ?, ?, ?)',
          [recipe.id, ingredient.name, ingredient.quantity, ingredient.order]
        );
      }
      
      // Insert new instructions
      for (const instruction of details.instructions) {
        await connection.execute(
          'INSERT INTO instructions (recipe_id, step_number, description) VALUES (?, ?, ?)',
          [recipe.id, instruction.step, instruction.description]
        );
      }
      
      console.log(`✅ Updated ${recipe.slug} - ${details.ingredients.length} ingredients, ${details.instructions.length} steps`);
    }

    console.log('\n🎉 All recipes updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

updateRecipeDetails();