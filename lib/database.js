const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite database path
const dbPath = path.join(process.cwd(), 'recipes.db');

// Create database connection
function getDatabase() {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
  });
}

// Create database connection with foreign keys enabled
function getDatabaseWithForeignKeys() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
  });
  
  // Enable foreign key constraints
  db.run('PRAGMA foreign_keys = ON');
  return db;
}

// Initialize database with required tables
function initializeDatabase() {
  const db = getDatabaseWithForeignKeys(); // Use foreign key enabled connection
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create recipes table with all geographic fields
      db.run(`
        CREATE TABLE IF NOT EXISTS recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(255) NOT NULL,
          ingredients TEXT NOT NULL,
          steps TEXT,
          image_url VARCHAR(500),
          cooking_time INTEGER,
          difficulty VARCHAR(50),
          history TEXT,
          plating_style VARCHAR(255),
          origin_country VARCHAR(100),
          country_code CHAR(2),
          cuisine VARCHAR(100),
          authenticity_status VARCHAR(50) DEFAULT 'pending',
          cultural_context TEXT,
          popularity_score REAL DEFAULT 0,
          status VARCHAR(20) DEFAULT 'published',
          latitude REAL,
          longitude REAL,
          region VARCHAR(100),
          city VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating recipes table:', err.message);
          reject(err);
        }
      });

      // Create recipe_ratings table
      db.run(`
        CREATE TABLE IF NOT EXISTS recipe_ratings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipe_id INTEGER,
          rating INTEGER CHECK(rating >= 1 AND rating <= 5),
          review TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (recipe_id) REFERENCES recipes (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating recipe_ratings table:', err.message);
          reject(err);
        }
      });

      // Create countries metadata table
      db.run(`
        CREATE TABLE IF NOT EXISTS countries (
          code CHAR(2) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          description TEXT,
          cuisine_types TEXT,
          cultural_context TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating countries table:', err.message);
          reject(err);
        }
      });

      // Create recipe_locations table for regional dish support
      db.run(`
        CREATE TABLE IF NOT EXISTS recipe_locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipe_id INTEGER NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          location_type VARCHAR(50) CHECK(location_type IN ('origin', 'regional_variant', 'cultural_influence')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating recipe_locations table:', err.message);
          reject(err);
        }
      });

      // Create indexes for geographic queries
      db.run(`CREATE INDEX IF NOT EXISTS idx_recipes_coordinates ON recipes(latitude, longitude)`, (err) => {
        if (err) console.error('Error creating coordinates index:', err.message);
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_recipes_country ON recipes(origin_country)`, (err) => {
        if (err) console.error('Error creating country index:', err.message);
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_recipes_country_code ON recipes(country_code)`, (err) => {
        if (err) console.error('Error creating country_code index:', err.message);
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_recipe_locations_recipe_id ON recipe_locations(recipe_id)`, (err) => {
        if (err) console.error('Error creating recipe_locations recipe_id index:', err.message);
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_recipe_locations_coordinates ON recipe_locations(latitude, longitude)`, (err) => {
        if (err) console.error('Error creating recipe_locations coordinates index:', err.message);
        console.log('✅ Database initialized successfully');
        resolve();
      });
    });

    db.close();
  });
}

// Execute query with promise wrapper
function executeQuery(query, params = []) {
  const db = getDatabaseWithForeignKeys(); // Use foreign key enabled connection
  
  return new Promise((resolve, reject) => {
    const trimmedQuery = query.trim().toUpperCase();
    if (trimmedQuery.startsWith('SELECT') || trimmedQuery.startsWith('PRAGMA')) {
      db.all(query, params, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve([rows]);
        }
      });
    } else {
      db.run(query, params, function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ insertId: this.lastID, changes: this.changes });
        }
      });
    }
  });
}

module.exports = {
  getDatabase,
  initializeDatabase,
  executeQuery
};

// Populate countries data
async function populateCountriesData() {
  const countries = [
    {
      code: 'IT',
      name: 'Italy',
      latitude: 41.8719,
      longitude: 12.5674,
      description: 'Italy is renowned for its diverse regional cuisines, from the pasta dishes of the north to the seafood specialties of the south.',
      cuisine_types: JSON.stringify(['Italian', 'Mediterranean', 'Regional Italian']),
      cultural_context: JSON.stringify({
        signatureDishes: ['Pasta Carbonara', 'Pizza Margherita', 'Risotto'],
        cookingTraditions: ['Fresh pasta making', 'Wood-fired cooking', 'Regional specialization'],
        culinaryInfluences: ['Roman', 'Etruscan', 'Arab', 'French']
      })
    },
    {
      code: 'TH',
      name: 'Thailand',
      latitude: 15.8700,
      longitude: 100.9925,
      description: 'Thai cuisine is known for its balance of sweet, sour, salty, and spicy flavors, with fresh herbs and aromatic spices.',
      cuisine_types: JSON.stringify(['Thai', 'Southeast Asian', 'Street Food']),
      cultural_context: JSON.stringify({
        signatureDishes: ['Pad Thai', 'Tom Yum', 'Green Curry'],
        cookingTraditions: ['Wok cooking', 'Fresh herb usage', 'Balance of flavors'],
        culinaryInfluences: ['Chinese', 'Indian', 'Malay', 'Khmer']
      })
    },
    {
      code: 'IN',
      name: 'India',
      latitude: 20.5937,
      longitude: 78.9629,
      description: 'Indian cuisine varies dramatically by region, featuring complex spice blends, diverse cooking methods, and vegetarian traditions.',
      cuisine_types: JSON.stringify(['Indian', 'South Asian', 'Vegetarian', 'Regional Indian']),
      cultural_context: JSON.stringify({
        signatureDishes: ['Chicken Tikka Masala', 'Biryani', 'Dal'],
        cookingTraditions: ['Spice grinding', 'Tandoor cooking', 'Vegetarian cuisine'],
        culinaryInfluences: ['Mughal', 'Persian', 'Portuguese', 'British']
      })
    }
  ];

  for (const country of countries) {
    try {
      await executeQuery(`
        INSERT OR IGNORE INTO countries (code, name, latitude, longitude, description, cuisine_types, cultural_context)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        country.code, country.name, country.latitude, country.longitude,
        country.description, country.cuisine_types, country.cultural_context
      ]);
    } catch (error) {
      console.error(`Error inserting country ${country.name}:`, error.message);
    }
  }
}

module.exports = {
  getDatabase,
  getDatabaseWithForeignKeys,
  initializeDatabase,
  executeQuery,
  populateCountriesData
};