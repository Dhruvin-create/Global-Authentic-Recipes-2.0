import sqlite3 from 'sqlite3';
import path from 'path';

// SQLite database path
const dbPath = path.join(process.cwd(), 'recipes.db');

// Create database connection
function getDatabase(): sqlite3.Database {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
  });
}

// Initialize database with required tables
export function initializeDatabase(): Promise<void> {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create recipes table
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
        } else {
          console.log('✅ Database initialized successfully');
          resolve();
        }
      });
    });

    db.close();
  });
}

// Execute query with promise wrapper
export function executeQuery(query: string, params: any[] = []): Promise<[any[]]> {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    if (query.trim().toUpperCase().startsWith('SELECT')) {
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
          resolve([{ insertId: this.lastID, changes: this.changes }]);
        }
      });
    }
  });
}