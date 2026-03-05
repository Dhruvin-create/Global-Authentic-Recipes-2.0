import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'switchback.proxy.rlwy.net',
  port: 20721,
  user: 'root',
  password: 'wBYdYMSqohVekErTKnqknEFScPkhkrEc',
  database: 'railway'
};

async function testQuery() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 Testing the exact query from API...\n');

    const slug = 'margherita-pizza';
    
    // Test the exact query from the API
    const recipeQuery = `
      SELECT 
        r.id,
        r.title,
        r.slug,
        r.description,
        r.image,
        r.category,
        r.difficulty,
        r.prep_time,
        r.cook_time,
        r.servings,
        r.calories,
        r.is_featured,
        r.view_count,
        r.created_at,
        r.updated_at,
        c.name as cuisine_name,
        c.slug as cuisine_slug,
        u.name as author_name,
        rs.like_count,
        rs.favorite_count,
        rs.review_count,
        rs.avg_rating
      FROM recipes r
      LEFT JOIN cuisines c ON r.cuisine_id = c.id
      LEFT JOIN users u ON r.author_id = u.id
      LEFT JOIN recipe_stats rs ON r.id = rs.id
      WHERE r.slug = ? AND r.is_published = 1
    `;
    
    console.log('Query:', recipeQuery);
    console.log('Params:', [slug]);
    console.log('\n');
    
    const [recipes] = await connection.execute(recipeQuery, [slug]);
    
    console.log('✅ Query executed successfully!');
    console.log('Results count:', recipes.length);
    
    if (recipes.length > 0) {
      console.log('\n📝 Recipe data:');
      console.log(JSON.stringify(recipes[0], null, 2));
      
      // Test ingredients query
      const [ingredients] = await connection.execute(
        'SELECT name, quantity, display_order FROM ingredients WHERE recipe_id = ? ORDER BY display_order ASC',
        [recipes[0].id]
      );
      console.log('\n🥕 Ingredients count:', ingredients.length);
      
      // Test instructions query
      const [instructions] = await connection.execute(
        'SELECT step_number, description, image FROM instructions WHERE recipe_id = ? ORDER BY step_number ASC',
        [recipes[0].id]
      );
      console.log('📋 Instructions count:', instructions.length);
      
      console.log('\n✅ All queries work perfectly!');
    } else {
      console.log('❌ No recipe found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connection closed');
    }
    process.exit(0);
  }
}

testQuery();