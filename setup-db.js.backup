#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates MySQL database and tables for Global Authentic Recipes
 * Usage: node setup-db.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'recipes_db',
};

const SQL_FILE = path.join(__dirname, 'database-schema.sql');

async function setupDatabase() {
  console.log('🗄️  Starting database setup...\n');
  console.log('Configuration:');
  console.log(`  Host: ${DB_CONFIG.host}`);
  console.log(`  User: ${DB_CONFIG.user}`);
  console.log(`  Database: ${DB_CONFIG.database}\n`);

  let connection;
  try {
    // Connect to MySQL (without specifying database first)
    console.log('📡 Connecting to MySQL...');
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
    });
    console.log('✅ Connected to MySQL\n');

    // Read and execute SQL schema
    if (!fs.existsSync(SQL_FILE)) {
      throw new Error(`SQL file not found: ${SQL_FILE}`);
    }

    const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log('🔨 Executing SQL statements...');
    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.log(`  ✓ ${statement.substring(0, 60)}${statement.length > 60 ? '...' : ''}`);
      } catch (err) {
        console.error(`  ✗ Error: ${err.message}`);
        if (!err.message.includes('already exists')) {
          throw err;
        }
      }
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Verify .env.local has correct DB credentials');
    console.log('  2. Run: npm run dev');
    console.log('  3. Visit: http://localhost:3000');
    console.log('  4. Try adding a recipe to test the database connection\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('\n⚠️  MySQL connection error. Make sure:');
      console.error('   - MySQL is running');
      console.error(`   - Host is correct: ${DB_CONFIG.host}`);
      console.error(`   - User exists: ${DB_CONFIG.user}`);
      console.error('   - Password is correct');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Authentication error. Check your MySQL credentials.');
    }
    
    process.exit(1);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
