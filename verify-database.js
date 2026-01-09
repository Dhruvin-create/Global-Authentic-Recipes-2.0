const { executeQuery } = require('./lib/database');

async function verifyDatabase() {
  try {
    console.log('=== Database Structure Verification ===');
    
    // Check tables
    const [tables] = await executeQuery('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('Tables:', tables.map(t => t.name));
    
    // Check recipes table structure
    const [recipeColumns] = await executeQuery('PRAGMA table_info(recipes)');
    console.log('\nRecipes table columns:', recipeColumns.map(c => `${c.name} (${c.type})`));
    
    // Check countries data
    const [countries] = await executeQuery('SELECT code, name FROM countries');
    console.log('\nCountries:', countries);
    
    // Check sample recipes
    const [recipes] = await executeQuery('SELECT title, origin_country, country_code, latitude, longitude FROM recipes');
    console.log('\nSample recipes:');
    if (recipes && recipes.length > 0) {
      recipes.forEach(r => {
        console.log(`  - ${r.title} (${r.origin_country}/${r.country_code}) at ${r.latitude}, ${r.longitude}`);
      });
    } else {
      console.log('  No recipes found');
    }
    
    // Check indexes
    const [indexes] = await executeQuery('SELECT name FROM sqlite_master WHERE type="index" AND name LIKE "idx_%"');
    console.log('\nGeographic indexes:', indexes.map(i => i.name));
    
    console.log('\n✅ Database verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
  }
}

verifyDatabase();