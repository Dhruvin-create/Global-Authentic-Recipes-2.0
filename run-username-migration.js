import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  let connection;

  try {
    console.log('🔄 Starting username fields migration...\n');

    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'global_recipes',
      multipleStatements: true
    });

    console.log('✅ Connected to database\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'database', 'migration-add-username-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Executing migration...\n');

    // Execute migration
    const [results] = await connection.query(migrationSQL);

    console.log('✅ Migration executed successfully!\n');

    // Verify migration
    const [users] = await connection.query(`
      SELECT 
        id,
        username,
        first_name,
        last_name,
        name,
        email,
        phone,
        auth_provider,
        oauth_provider
      FROM users
      LIMIT 5
    `);

    console.log('📊 Sample users after migration:');
    console.table(users);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env.local file if needed');
    console.log('2. Restart your Next.js development server');
    console.log('3. Test the new registration form');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n💡 To rollback, run:');
    console.error('   node run-username-rollback.js');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run migration
runMigration();
