import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'switchback.proxy.rlwy.net',
  port: 20721,
  user: 'root',
  password: 'wBYdYMSqohVekErTKnqknEFScPkhkrEc',
  database: 'railway'
};

async function debugRecipe() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 Debugging recipe data...\n');

    // Check the exact recipe data
    const [recipes] = await connection.execute(
      'SELECT * FROM recipes WHERE slug = ? LIMIT 1',
      ['margherita-pizza']
    );
    
    if (recipes.length > 0) {
      console.log('Recipe found:');
      console.log(JSON.stringify(recipes[0], null, 2));
    } else {
      console.log('❌ No recipe found with slug: margherita-pizza');
    }

    // Check ingredients
    const [ingredients] = await connection.execute(
      'SELECT * FROM ingredients WHERE recipe_id = ?',
      [recipes[0]?.id]
    );
    console.log(`\nIngredients count: ${ingredients.length}`);

    // Check instructions  
    const [instructions] = await connection.execute(
      'SELECT * FROM instructions WHERE recipe_id = ?',
      [recipes[0]?.id]
    );
    console.log(`Instructions count: ${instructions.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
    process.exit(0);
  }
}

debugRecipe();