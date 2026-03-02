// Import Seed Data Script
// Run: node import-seed-data.js

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'global_recipes',
  multipleStatements: true
};

async function importSeedData() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');

    // Read seed SQL file
    const seedFilePath = path.join(__dirname, 'database', 'seed-recipes.sql');
    console.log(`📖 Reading seed file: ${seedFilePath}`);
    
    const seedSQL = fs.readFileSync(seedFilePath, 'utf8');
    
    // Execute seed SQL
    console.log('🌱 Importing seed data...');
    await connection.query(seedSQL);
    
    console.log('✅ Seed data imported successfully!');
    
    // Verify data
    const [recipes] = await connection.query('SELECT COUNT(*) as count FROM recipes');
    console.log(`📊 Total recipes in database: ${recipes[0].count}`);
    
    // Show sample recipes
    const [sampleRecipes] = await connection.query('SELECT id, name, cuisine, difficulty FROM recipes LIMIT 5');
    console.log('\n📋 Sample recipes:');
    sampleRecipes.forEach((recipe, index) => {
      console.log(`   ${index + 1}. ${recipe.name} (${recipe.cuisine}) - ${recipe.difficulty}`);
    });
    
    console.log('\n🎉 Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing seed data:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run import
importSeedData();
