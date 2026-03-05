import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'switchback.proxy.rlwy.net',
  port: 20721,
  user: 'root',
  password: 'wBYdYMSqohVekErTKnqknEFScPkhkrEc',
  database: 'railway'
};

async function importCuisines() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🌍 Importing cuisines...\n');

    const cuisines = [
      { name: 'Italian', slug: 'italian', description: 'Classic Italian cuisine with pasta, pizza, and more' },
      { name: 'Japanese', slug: 'japanese', description: 'Traditional Japanese dishes including sushi and ramen' },
      { name: 'Indian', slug: 'indian', description: 'Spicy and flavorful Indian curries and tandoori' },
      { name: 'Mexican', slug: 'mexican', description: 'Authentic Mexican tacos, burritos, and more' },
      { name: 'American', slug: 'american', description: 'Classic American comfort food' },
      { name: 'Thai', slug: 'thai', description: 'Sweet, sour, and spicy Thai cuisine' },
      { name: 'French', slug: 'french', description: 'Elegant French pastries and dishes' },
      { name: 'Chinese', slug: 'chinese', description: 'Traditional Chinese stir-fries and dim sum' },
      { name: 'Mediterranean', slug: 'mediterranean', description: 'Healthy Mediterranean diet dishes' },
      { name: 'Korean', slug: 'korean', description: 'Spicy Korean BBQ and kimchi' },
      { name: 'Spanish', slug: 'spanish', description: 'Tapas and paella from Spain' },
      { name: 'Greek', slug: 'greek', description: 'Fresh Greek salads and gyros' },
      { name: 'Vietnamese', slug: 'vietnamese', description: 'Light and fresh Vietnamese pho' },
      { name: 'Middle Eastern', slug: 'middle-eastern', description: 'Flavorful Middle Eastern kebabs and hummus' },
      { name: 'Brazilian', slug: 'brazilian', description: 'Rich Brazilian churrasco and feijoada' }
    ];

    let inserted = 0;
    for (const cuisine of cuisines) {
      try {
        const id = crypto.randomUUID();
        await connection.execute(
          `INSERT INTO cuisines (id, name, slug, description, image, created_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [id, cuisine.name, cuisine.slug, cuisine.description, null]
        );
        console.log(`✅ ${cuisine.name}`);
        inserted++;
      } catch (err) {
        console.log(`❌ ${cuisine.name}: ${err.message}`);
      }
    }

    console.log(`\n🎉 Imported ${inserted} cuisines successfully!`);

    // Verify
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM cuisines');
    console.log(`📊 Total cuisines in database: ${count[0].total}`);

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

importCuisines();
