import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'global_recipes'
};

async function checkData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Check recipes
    const [recipes] = await connection.execute('SELECT id, title FROM recipes');
    console.log('📋 Existing recipes:');
    recipes.forEach(recipe => {
      console.log(`   - ${recipe.id}: ${recipe.title}`);
    });
    console.log(`Total: ${recipes.length}\n`);
    
    // Check cuisines
    const [cuisines] = await connection.execute('SELECT id, name FROM cuisines');
    console.log('🍽️ Existing cuisines:');
    cuisines.forEach(cuisine => {
      console.log(`   - ${cuisine.id}: ${cuisine.name}`);
    });
    console.log(`Total: ${cuisines.length}\n`);
    
    // Check users
    const [users] = await connection.execute('SELECT id, username, role FROM users');
    console.log('👥 Existing users:');
    users.forEach(user => {
      console.log(`   - ${user.id}: ${user.username} (${user.role})`);
    });
    console.log(`Total: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

checkData();