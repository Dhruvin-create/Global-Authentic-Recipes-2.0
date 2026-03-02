// Simple Seed Script
import { executeQuery } from './lib/database.js';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'global_recipes'
};

async function seedData() {
  let connection;
  
  try {
    console.log('🌱 Starting seed process...\n');

    // Create direct connection
    connection = await mysql.createConnection(dbConfig);

    // 1. Insert Cuisines
    console.log('📝 Inserting cuisines...');
    const cuisines = [
      { id: 'cuisine-italian', name: 'Italian', slug: 'italian', description: 'Traditional Italian cuisine', image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400' },
      { id: 'cuisine-japanese', name: 'Japanese', slug: 'japanese', description: 'Authentic Japanese cuisine', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
      { id: 'cuisine-indian', name: 'Indian', slug: 'indian', description: 'Rich Indian flavors', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { id: 'cuisine-mexican', name: 'Mexican', slug: 'mexican', description: 'Vibrant Mexican dishes', image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400' }
    ];

    for (const cuisine of cuisines) {
      await connection.execute(
        'INSERT IGNORE INTO cuisines (id, name, slug, description, image, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
        [cuisine.id, cuisine.name, cuisine.slug, cuisine.description, cuisine.image]
      );
    }
    console.log('✅ Cuisines inserted\n');

    // 2. Get author ID
    console.log('📝 Getting author ID...');
    const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
    if (users.length === 0) {
      console.error('❌ No users found! Please create a user first.');
      return;
    }
    const authorId = users[0].id;
    console.log(`✅ Using author ID: ${authorId}\n`);

    // 3. Insert Recipes
    console.log('📝 Inserting recipes...');
    const recipes = [
      {
        id: 'recipe-001',
        title: 'Margherita Pizza',
        slug: 'margherita-pizza',
        description: 'Classic Italian pizza with fresh mozzarella, basil, and tomato sauce.',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
        category: 'MAIN_COURSE',
        cuisine_id: 'cuisine-italian',
        difficulty: 'EASY',
        prep_time: 20,
        cook_time: 15,
        servings: 4,
        calories: 285,
        is_published: true,
        is_featured: true
      },
      {
        id: 'recipe-002',
        title: 'Sushi Rolls',
        slug: 'sushi-rolls',
        description: 'Traditional sushi rolls with rice, nori, and fresh vegetables or fish.',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
        category: 'MAIN_COURSE',
        cuisine_id: 'cuisine-japanese',
        difficulty: 'MEDIUM',
        prep_time: 30,
        cook_time: 10,
        servings: 4,
        calories: 200,
        is_published: true,
        is_featured: true
      },
      {
        id: 'recipe-003',
        title: 'Paneer Butter Masala',
        slug: 'paneer-butter-masala',
        description: 'Creamy North Indian curry made with paneer cubes in rich tomato gravy.',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
        category: 'MAIN_COURSE',
        cuisine_id: 'cuisine-indian',
        difficulty: 'MEDIUM',
        prep_time: 15,
        cook_time: 25,
        servings: 4,
        calories: 350,
        is_published: true,
        is_featured: true
      },
      {
        id: 'recipe-004',
        title: 'Tacos Al Pastor',
        slug: 'tacos-al-pastor',
        description: 'Mexican street-style tacos with marinated pork and pineapple.',
        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
        category: 'MAIN_COURSE',
        cuisine_id: 'cuisine-mexican',
        difficulty: 'HARD',
        prep_time: 60,
        cook_time: 20,
        servings: 4,
        calories: 400,
        is_published: true,
        is_featured: true
      }
    ];

    for (const recipe of recipes) {
      await connection.execute(
        `INSERT IGNORE INTO recipes (
          id, title, slug, description, image, category, cuisine_id,
          difficulty, prep_time, cook_time, servings, calories,
          is_published, is_featured, author_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipe.id, recipe.title, recipe.slug, recipe.description, recipe.image,
          recipe.category, recipe.cuisine_id, recipe.difficulty, recipe.prep_time,
          recipe.cook_time, recipe.servings, recipe.calories, recipe.is_published,
          recipe.is_featured, authorId
        ]
      );
    }
    console.log('✅ Recipes inserted\n');

    // 4. Verify
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM recipes');
    console.log(`\n🎉 Seed completed! Total recipes: ${count[0].total}`);

  } catch (error) {
    console.error('❌ Seed error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

seedData();
