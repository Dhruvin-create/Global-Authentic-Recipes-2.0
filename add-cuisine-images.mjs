import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'switchback.proxy.rlwy.net',
  port: 20721,
  user: 'root',
  password: 'wBYdYMSqohVekErTKnqknEFScPkhkrEc',
  database: 'railway'
};

const cuisineImages = {
  'american': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', // Burger
  'brazilian': 'https://images.unsplash.com/photo-1612871689356-64e3f7f7f6c8?w=800&q=80', // Brazilian BBQ
  'chinese': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80', // Chinese food
  'french': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80', // French cuisine
  'greek': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', // Greek salad
  'indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', // Indian curry
  'italian': 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&q=80', // Italian pasta
  'japanese': 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80', // Japanese sushi
  'korean': 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80', // Korean BBQ
  'mediterranean': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80', // Mediterranean food
  'mexican': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80', // Mexican tacos
  'middle-eastern': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80', // Middle Eastern
  'spanish': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&q=80', // Spanish paella
  'thai': 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80', // Thai food
  'vietnamese': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80' // Vietnamese pho
};

async function addCuisineImages() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🖼️  Adding cuisine images...\n');

    let updated = 0;
    
    for (const [slug, imageUrl] of Object.entries(cuisineImages)) {
      try {
        const [result] = await connection.execute(
          'UPDATE cuisines SET image = ? WHERE slug = ?',
          [imageUrl, slug]
        );
        
        if (result.affectedRows > 0) {
          console.log(`✅ Updated ${slug}`);
          updated++;
        } else {
          console.log(`⚠️  Cuisine not found: ${slug}`);
        }
      } catch (err) {
        console.log(`❌ Failed to update ${slug}: ${err.message}`);
      }
    }

    console.log(`\n🎉 Updated ${updated} cuisine images!`);

    // Verify
    const [cuisines] = await connection.execute(
      'SELECT name, slug, image FROM cuisines WHERE image IS NOT NULL ORDER BY name'
    );
    console.log(`\n📊 Cuisines with images: ${cuisines.length}`);

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

addCuisineImages();