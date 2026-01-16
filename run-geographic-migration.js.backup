const { executeQuery, getDatabase } = require('./lib/database');
const fs = require('fs');
const path = require('path');

async function runGeographicMigration() {
  try {
    console.log('🗺️  Starting geographic data migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', '004_add_enhanced_geographic_data.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await executeQuery(statement);
        console.log(`✅ Statement ${i + 1} completed successfully`);
      } catch (error) {
        // Some statements might fail if they already exist (like ALTER TABLE), that's okay
        if (error.message.includes('duplicate column name') || 
            error.message.includes('already exists') ||
            error.message.includes('UNIQUE constraint failed')) {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`);
        } else {
          console.error(`❌ Statement ${i + 1} failed:`, error.message);
          throw error;
        }
      }
    }
    
    // Verify the migration by checking table structure
    console.log('🔍 Verifying migration results...');
    
    // Check recipes table structure
    const [recipeColumns] = await executeQuery("PRAGMA table_info(recipes)");
    console.log(`📊 Recipes table has ${recipeColumns.length} columns`);
    
    // Check countries table
    const [countries] = await executeQuery("SELECT COUNT(*) as count FROM countries");
    console.log(`🌍 Countries table has ${countries[0].count} countries`);
    
    // Check recipe_locations table exists
    const [locationTables] = await executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='recipe_locations'");
    console.log(`📍 Recipe locations table: ${locationTables.length > 0 ? 'Created' : 'Missing'}`);
    
    // Check indexes
    const [indexes] = await executeQuery("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'");
    console.log(`🔗 Created ${indexes.length} geographic indexes`);
    
    console.log('✅ Geographic migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Geographic migration failed:', error.message);
    process.exit(1);
  }
}

runGeographicMigration();