const { executeQuery, initializeDatabase } = require('./lib/database');

async function testMapAPI() {
  try {
    console.log('🧪 Testing Map API functionality...');
    
    // Initialize database
    await initializeDatabase();
    
    // Test the same query that the map API uses
    const [rows] = await executeQuery(`
      SELECT 
        r.id,
        r.title,
        r.origin_country,
        r.cuisine,
        r.image_url,
        r.cooking_time,
        r.difficulty,
        r.authenticity_status,
        r.cultural_context,
        r.latitude,
        r.longitude,
        r.region,
        r.city,
        r.created_at
      FROM recipes r
      WHERE r.status = 'published'
      ORDER BY r.popularity_score DESC, r.created_at DESC
    `);

    console.log(`📊 Found ${rows.length} recipes`);
    
    // Process recipes like the API does
    const recipes = rows.map(row => {
      let latitude = row.latitude;
      let longitude = row.longitude;

      // Country coordinates mapping (simplified)
      const COUNTRY_COORDINATES = {
        'Italy': { lat: 41.8719, lng: 12.5674 },
        'Thailand': { lat: 15.8700, lng: 100.9925 },
        'India': { lat: 20.5937, lng: 78.9629 }
      };

      // If no specific coordinates, use country coordinates
      if (!latitude || !longitude) {
        const countryCoords = COUNTRY_COORDINATES[row.origin_country];
        if (countryCoords) {
          latitude = countryCoords.lat + (Math.random() - 0.5) * 4;
          longitude = countryCoords.lng + (Math.random() - 0.5) * 4;
        }
      }

      return {
        id: row.id.toString(),
        title: row.title,
        origin_country: row.origin_country,
        cuisine: row.cuisine,
        image_url: row.image_url,
        cooking_time: row.cooking_time,
        difficulty: row.difficulty,
        authenticity_status: row.authenticity_status,
        cultural_context: row.cultural_context,
        latitude,
        longitude,
        region: row.region,
        city: row.city,
        created_at: row.created_at
      };
    }).filter(recipe => recipe.latitude && recipe.longitude);

    console.log(`🗺️  Recipes with coordinates: ${recipes.length}`);
    
    // Display sample recipes
    recipes.forEach(recipe => {
      console.log(`  - ${recipe.title} (${recipe.origin_country}) at ${recipe.latitude}, ${recipe.longitude}`);
    });

    // Get unique countries
    const countries = [...new Set(recipes.map(r => r.origin_country))].sort();
    console.log(`🌍 Countries: ${countries.join(', ')}`);

    // Simulate API response
    const apiResponse = {
      success: true,
      recipes,
      total: recipes.length,
      countries
    };

    console.log('\n✅ Map API test completed successfully!');
    console.log('📋 API Response structure:', {
      success: apiResponse.success,
      recipeCount: apiResponse.recipes.length,
      totalCount: apiResponse.total,
      countryCount: apiResponse.countries.length
    });
    
  } catch (error) {
    console.error('❌ Map API test failed:', error.message);
  }
}

testMapAPI();