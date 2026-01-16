const { initializeDatabase, executeQuery, populateCountriesData } = require('./lib/database');

async function setupDatabase() {
  try {
    console.log('🗄️  Setting up SQLite database...');
    
    // Initialize database
    await initializeDatabase();
    
    // Populate countries data
    await populateCountriesData();
    
    // Add some sample recipes for testing
    const sampleRecipes = [
      {
        title: 'Spaghetti Carbonara',
        ingredients: 'Spaghetti, eggs, pancetta, parmesan cheese, black pepper',
        steps: '1. Cook pasta 2. Fry pancetta 3. Mix eggs and cheese 4. Combine all',
        origin_country: 'Italy',
        country_code: 'IT',
        cuisine: 'Italian',
        difficulty: 'Medium',
        cooking_time: 30,
        authenticity_status: 'authentic',
        latitude: 41.8719,
        longitude: 12.5674,
        city: 'Rome',
        region: 'Lazio'
      },
      {
        title: 'Pad Thai',
        ingredients: 'Rice noodles, shrimp, tofu, bean sprouts, tamarind, fish sauce',
        steps: '1. Soak noodles 2. Prepare sauce 3. Stir fry ingredients 4. Serve with lime',
        origin_country: 'Thailand',
        country_code: 'TH',
        cuisine: 'Thai',
        difficulty: 'Medium',
        cooking_time: 25,
        authenticity_status: 'authentic',
        latitude: 13.7563,
        longitude: 100.5018,
        city: 'Bangkok',
        region: 'Central Thailand'
      },
      {
        title: 'Chicken Tikka Masala',
        ingredients: 'Chicken, yogurt, tomatoes, cream, spices, onions, garlic, ginger',
        steps: '1. Marinate chicken 2. Grill chicken 3. Make sauce 4. Combine and simmer',
        origin_country: 'India',
        country_code: 'IN',
        cuisine: 'Indian',
        difficulty: 'Hard',
        cooking_time: 60,
        authenticity_status: 'fusion',
        latitude: 28.6139,
        longitude: 77.2090,
        city: 'Delhi',
        region: 'North India'
      }
    ];

    for (const recipe of sampleRecipes) {
      await executeQuery(`
        INSERT INTO recipes (
          title, ingredients, steps, origin_country, country_code, cuisine, difficulty, 
          cooking_time, authenticity_status, latitude, longitude, city, region
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        recipe.title, recipe.ingredients, recipe.steps, recipe.origin_country, recipe.country_code,
        recipe.cuisine, recipe.difficulty, recipe.cooking_time, recipe.authenticity_status,
        recipe.latitude, recipe.longitude, recipe.city, recipe.region
      ]);
    }

    console.log('✅ Database setup completed successfully!');
    console.log('📊 Added', sampleRecipes.length, 'sample recipes');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();