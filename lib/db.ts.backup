import sqlite3 from 'sqlite3';
import mysql from 'mysql2/promise';
import path from 'path';

// Database configuration
const isProduction = process.env.NODE_ENV === 'production';
const useMySQL = process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_PASSWORD);

// SQLite configuration
const dbPath = path.join(process.cwd(), 'recipes.db');

// MySQL configuration
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'recipes_db',
  charset: 'utf8mb4'
};

// Database connection interface
interface DatabaseConnection {
  query(sql: string, params?: any[]): Promise<any>;
  close(): Promise<void>;
}

// SQLite connection wrapper
class SQLiteConnection implements DatabaseConnection {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ insertId: this.lastID, changes: this.changes });
        });
      }
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// MySQL connection wrapper
class MySQLConnection implements DatabaseConnection {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const [rows] = await this.connection.execute(sql, params);
    return rows;
  }

  async close(): Promise<void> {
    await this.connection.end();
  }
}

// Create database connection
export async function createConnection(): Promise<DatabaseConnection> {
  if (useMySQL) {
    try {
      const connection = await mysql.createConnection(mysqlConfig);
      return new MySQLConnection(connection);
    } catch (error) {
      console.warn('MySQL connection failed, falling back to SQLite:', error);
      return new SQLiteConnection();
    }
  } else {
    return new SQLiteConnection();
  }
}

// Execute query helper
export async function executeQuery(sql: string, params: any[] = []): Promise<any> {
  const connection = await createConnection();
  try {
    const result = await connection.query(sql, params);
    return result;
  } finally {
    await connection.close();
  }
}

// Initialize database with required tables
export async function initializeDatabase(): Promise<void> {
  const connection = await createConnection();
  
  try {
    // Create recipes table
    await connection.query(`
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
    `);

    // Create recipe_ratings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recipe_ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        review TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
      )
    `);

    // Create search_analytics table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS search_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query VARCHAR(255),
        results_count INTEGER,
        search_type VARCHAR(50),
        response_time_ms INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database initialized successfully');
  } finally {
    await connection.close();
  }
}

// Database info
export function getDatabaseInfo() {
  return {
    type: useMySQL ? 'MySQL' : 'SQLite',
    config: useMySQL ? { ...mysqlConfig, password: '***' } : { path: dbPath }
  };
}