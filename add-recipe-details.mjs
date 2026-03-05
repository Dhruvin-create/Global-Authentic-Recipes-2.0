import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'switchback.proxy.rlwy.net',
  port: 20721,
  user: 'root',
  password: 'wBYdYMSqohVekErTKnqknEFScPkhkrEc',
  database: 'railway'
};

async function addRecipeDetails() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🍳 Adding recipe ingredients and instructions...\n');

    // Get all recipes
    const [recipes] = await connection.execute('SELECT id, slug, title FROM recipes');
    
    for (const recipe of recipes) {
      console.log(`📝 Adding details for: ${recipe.title}`);
      
      // Add basic ingredients
      const ingredients = [
        { name: 'Main ingredient', quantity: '2 cups', order: 1 },
        { name: 'Secondary ingredient', quantity: '1 cup', order: 2 },
        { name: 'Seasoning', quantity: 'To taste', order: 3 }
      ];
      
      for (const ingredient of ingredients) {
        await connection.execute(
          'INSERT INTO ingredients (recipe_id, name, quantity, display_order) VALUES (?, ?, ?, ?)',
          [recipe.id, ingredient.name, ingredient.quantity, ingredient.order]
        );
      }
      
      // Add basic instructions
      const instructions = [
        { step: 1, description: 'Prepare all ingredients and equipment.' },
        { step: 2, description: 'Follow traditional cooking method for this dish.' },
        { step: 3, description: 'Serve hot and enjoy!' }
      ];
      
      for (const instruction of instructions) {
        await connection.execute(
          'INSERT INTO instructions (recipe_id, step_number, description) VALUES (?, ?, ?)',
          [recipe.id, instruction.step, instruction.description]
        );
      }
      
      console.log(`✅ Added ingredients and instructions for ${recipe.title}`);
    }

    console.log('\n🎉 All recipe details added successfully!');

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

addRecipeDetails();