import mysql from 'mysql2/promise';
import fs from 'fs';

// Railway FRESH credentials
const config = {
  host: 'switchback.proxy.rlwy.net',
  port: 20721,
  user: 'root',
  password: 'wBYdYMSqohVekErTKnqknEFScPkhkrEc',
  database: 'railway',
  connectTimeout: 30000,
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Step 1: Testing connection...\n');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to Railway database!\n');
    
    // Test query
    const [test] = await connection.execute('SELECT DATABASE() as db, NOW() as time');
    console.log('✅ Current database:', test[0].db);
    console.log('✅ Server time:', test[0].time);
    
    // Check existing tables
    console.log('\n🔍 Step 2: Checking existing tables...\n');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`Found ${tables.length} existing tables`);
    
    if (tables.length > 0) {
      console.log('⚠️  Database already has tables. Do you want to continue? (This will add more tables)');
    }
    
    // Read schema file
    console.log('\n📥 Step 3: Reading schema.sql...\n');
    const schemaSQL = fs.readFileSync('database/schema.sql', 'utf8');
    
    // Remove CREATE DATABASE and USE statements
    const cleanSQL = schemaSQL
      .replace(/CREATE DATABASE IF NOT EXISTS.*?;/gi, '')
      .replace(/USE .*?;/gi, '')
      .trim();
    
    console.log('✅ Schema file loaded\n');
    
    // Execute schema
    console.log('🚀 Step 4: Creating tables...\n');
    await connection.query(cleanSQL);
    console.log('✅ Tables created successfully!\n');
    
    // Verify tables
    console.log('🔍 Step 5: Verifying tables...\n');
    const [newTables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Total tables: ${newTables.length}`);
    newTables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    console.log('\n🎉 Database setup complete!');
    console.log('\n📊 Next steps:');
    console.log('1. Run: node insert-recipes-final.mjs (to import recipes)');
    console.log('2. Update Vercel environment variables');
    console.log('3. Test: https://globalrecipes2-0.vercel.app/api/test-db');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connection closed');
    }
    process.exit(0);
  }
}

setupDatabase();
