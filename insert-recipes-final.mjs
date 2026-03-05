import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'switchback.proxy.rlwy.net',
  port: 20721,
  user: 'root',
  password: 'wBYdYMSqohVekErTKnqknEFScPkhkrEc',
  database: 'railway'
};


async function insertRecipes() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🌱 Inserting recipes...\n');

    // Get existing cuisine IDs
    const [cuisines] = await connection.execute('SELECT id, name FROM cuisines');
    const cuisineMap = {};
    cuisines.forEach(c => {
      cuisineMap[c.name.toLowerCase()] = c.id;
    });

    // Get author ID (or use NULL if no users exist)
    let authorId = null;
    const [users] = await connection.execute('SELECT id FROM users WHERE role = "ADMIN" LIMIT 1');
    if (users.length > 0) {
      authorId = users[0].id;
      console.log(`✅ Using author ID: ${authorId}\n`);
    } else {
      console.log('⚠️  No users found, recipes will have NULL author_id\n');
    }

    const recipes = [
      {
        id: 'recipe-margherita-pizza',
        title: 'Margherita Pizza',
        slug: 'margherita-pizza',
        description: 'Classic Italian pizza with fresh mozzarella, basil, and tomato sauce. A timeless favorite that brings the authentic taste of Naples to your kitchen.',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
        category: 'MAIN_COURSE',
        cuisine_id: cuisineMap['italian'],
        cuisine_name: 'Italian',
        difficulty: 'EASY',
        prep_time: 20,
        cook_time: 15,
        servings: 4,
        calories: 285
      },
      {
        id: 'recipe-sushi-rolls',
        title: 'Sushi Rolls',
        slug: 'sushi-rolls',
        description: 'Traditional sushi rolls with rice, nori, and fresh vegetables or fish. Perfect for a healthy and delicious meal.',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
        category: 'MAIN_COURSE',
        cuisine_id: cuisineMap['japanese'],
        cuisine_name: 'Japanese',
        difficulty: 'MEDIUM',
        prep_time: 30,
        cook_time: 10,
        servings: 4,
        calories: 200
      },
      {
        id: 'recipe-paneer-butter-masala',
        title: 'Paneer Butter Masala',
        slug: 'paneer-butter-masala',
        description: 'Creamy North Indian curry made with paneer cubes in rich tomato gravy. A vegetarian delight that melts in your mouth.',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
        category: 'MAIN_COURSE',
        cuisine_id: cuisineMap['indian'],
        cuisine_name: 'Indian',
        difficulty: 'MEDIUM',
        prep_time: 15,
        cook_time: 25,
        servings: 4,
        calories: 350
      },
      {
        id: 'recipe-tacos-al-pastor',
        title: 'Tacos Al Pastor',
        slug: 'tacos-al-pastor',
        description: 'Mexican street-style tacos with marinated pork and pineapple. Bursting with authentic flavors and spices.',
        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
        category: 'MAIN_COURSE',
        cuisine_id: cuisineMap['mexican'],
        cuisine_name: 'Mexican',
        difficulty: 'HARD',
        prep_time: 60,
        cook_time: 20,
        servings: 4,
        calories: 400
      },
      {
        id: 'recipe-chocolate-brownies',
        title: 'Chocolate Brownies',
        slug: 'chocolate-brownies',
        description: 'Rich and fudgy chocolate brownies with crispy top. Perfect dessert for chocolate lovers.',
        image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800&q=80',
        category: 'DESSERT',
        cuisine_id: cuisineMap['american'],
        cuisine_name: 'American',
        difficulty: 'EASY',
        prep_time: 15,
        cook_time: 25,
        servings: 6,
        calories: 450
      },
      {
        id: 'recipe-pad-thai',
        title: 'Pad Thai',
        slug: 'pad-thai',
        description: 'Famous Thai stir-fried noodles with tamarind sauce. A perfect balance of sweet, sour, and savory flavors.',
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80',
        category: 'MAIN_COURSE',
        cuisine_id: cuisineMap['thai'],
        cuisine_name: 'Thai',
        difficulty: 'MEDIUM',
        prep_time: 20,
        cook_time: 15,
        servings: 4,
        calories: 330
      },
      {
        id: 'recipe-croissants',
        title: 'Croissants',
        slug: 'croissants',
        description: 'Flaky buttery French pastry perfect for breakfast. A labor of love that rewards with incredible taste.',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
        category: 'BREAKFAST',
        cuisine_id: cuisineMap['french'],
        cuisine_name: 'French',
        difficulty: 'HARD',
        prep_time: 120,
        cook_time: 20,
        servings: 6,
        calories: 300
      },
      {
        id: 'recipe-kung-pao-chicken',
        title: 'Kung Pao Chicken',
        slug: 'kung-pao-chicken',
        description: 'Spicy Chinese stir-fry with chicken, peanuts, and vegetables in savory sauce.',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
        category: 'MAIN_COURSE',
        cuisine_id: cuisineMap['chinese'],
        cuisine_name: 'Chinese',
        difficulty: 'MEDIUM',
        prep_time: 15,
        cook_time: 10,
        servings: 4,
        calories: 320
      }
    ];

    let inserted = 0;
    for (const recipe of recipes) {
      try {
        await connection.execute(
          `INSERT INTO recipes (
            id, title, slug, description, image, category, cuisine_id,
            difficulty, prep_time, cook_time, servings, calories,
            is_published, is_featured, author_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            recipe.id, recipe.title, recipe.slug, recipe.description, recipe.image,
            recipe.category, recipe.cuisine_id, recipe.difficulty, recipe.prep_time,
            recipe.cook_time, recipe.servings, recipe.calories, true, true, authorId
          ]
        );
        console.log(`✅ ${recipe.title}`);
        inserted++;
      } catch (err) {
        console.log(`❌ ${recipe.title}: ${err.message}`);
      }
    }

    console.log(`\n🎉 Inserted ${inserted} recipes successfully!`);

    // Verify
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM recipes');
    console.log(`📊 Total recipes in database: ${count[0].total}`);

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

insertRecipes();