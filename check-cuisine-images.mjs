import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'switchback.proxy.rlwy.net',
  port: 20721,
  user: 'root',
  password: 'wBYdYMSqohVekErTKnqknEFScPkhkrEc',
  database: 'railway'
};

async function checkCuisineImages() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 Checking cuisine images...\n');

    const [cuisines] = await connection.execute('SELECT id, name, slug, image FROM cuisines ORDER BY name');
    
    console.log(`Found ${cuisines.length} cuisines:\n`);
    
    cuisines.forEach(cuisine => {
      const hasImage = cuisine.image ? '✅' : '❌';
      console.log(`${hasImage} ${cuisine.name} (${cuisine.slug})`);
      if (cuisine.image) {
        console.log(`   Image: ${cuisine.image}`);
      }
    });

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

checkCuisineImages();