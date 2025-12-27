const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recipes_db',
  charset: 'utf8mb4',
  multipleStatements: true
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📖 Reading migration file...');
    const migrationPath = path.join(__dirname, 'migrations', '002_add_smart_search_features.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    console.log('🚀 Running Smart Search System migration...');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        if (statement.toLowerCase().includes('delimiter')) {
          // Handle stored procedure creation separately
          continue;
        }
        
        await connection.execute(statement);
        successCount++;
        
        // Log progress for major operations
        if (statement.toLowerCase().includes('create table')) {
          const tableName = statement.match(/create table (?:if not exists )?`?(\w+)`?/i)?.[1];
          console.log(`✅ Created table: ${tableName}`);
        } else if (statement.toLowerCase().includes('alter table')) {
          const tableName = statement.match(/alter table `?(\w+)`?/i)?.[1];
          console.log(`✅ Modified table: ${tableName}`);
        } else if (statement.toLowerCase().includes('create index')) {
          const indexName = statement.match(/create index `?(\w+)`?/i)?.[1];
          console.log(`✅ Created index: ${indexName}`);
        }
        
      } catch (error) {
        errorCount++;
        console.warn(`⚠️  Statement failed (continuing): ${error.message}`);
        console.warn(`   Statement: ${statement.substring(0, 100)}...`);
      }
    }
    
    // Handle stored procedure creation separately
    try {
      const procedureSQL = `
        DROP PROCEDURE IF EXISTS UpdatePopularityScores;
        
        DELIMITER //
        CREATE PROCEDURE UpdatePopularityScores()
        BEGIN
          DECLARE done INT DEFAULT FALSE;
          DECLARE recipe_id_var INT;
          DECLARE view_count INT;
          DECLARE rating_avg DECIMAL(3,2);
          DECLARE rating_count INT;
          DECLARE search_count_var INT;
          DECLARE popularity DECIMAL(3,2);
          
          DECLARE recipe_cursor CURSOR FOR 
            SELECT r.id FROM recipes r WHERE r.status = 'published';
          
          DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
          
          OPEN recipe_cursor;
          
          recipe_loop: LOOP
            FETCH recipe_cursor INTO recipe_id_var;
            IF done THEN
              LEAVE recipe_loop;
            END IF;
            
            -- Get view count (last 30 days)
            SELECT COUNT(*) INTO view_count
            FROM recipe_views 
            WHERE recipe_id = recipe_id_var 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
            
            -- Get average rating and count
            SELECT COALESCE(AVG(rating), 0), COUNT(*) INTO rating_avg, rating_count
            FROM recipe_ratings 
            WHERE recipe_id = recipe_id_var;
            
            -- Get search count (last 30 days)
            SELECT COALESCE(search_count, 0) INTO search_count_var
            FROM recipes 
            WHERE id = recipe_id_var;
            
            -- Calculate popularity score (0-1 scale)
            SET popularity = LEAST(1.0, 
              (view_count * 0.4 + rating_avg * 0.1 * rating_count * 0.3 + search_count_var * 0.3) / 100
            );
            
            -- Update recipe popularity score
            UPDATE recipes 
            SET popularity_score = popularity 
            WHERE id = recipe_id_var;
            
          END LOOP;
          
          CLOSE recipe_cursor;
        END //
        DELIMITER ;
      `;
      
      await connection.query(procedureSQL);
      console.log('✅ Created stored procedure: UpdatePopularityScores');
      
    } catch (error) {
      console.warn(`⚠️  Stored procedure creation failed: ${error.message}`);
    }
    
    // Verify migration success
    console.log('\n🔍 Verifying migration...');
    
    const tables = [
      'search_analytics',
      'generated_recipes', 
      'recipe_ratings',
      'cultural_knowledge',
      'search_suggestions',
      'recipe_views'
    ];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          console.log(`✅ Table verified: ${table}`);
        } else {
          console.log(`❌ Table missing: ${table}`);
        }
      } catch (error) {
        console.log(`❌ Table verification failed: ${table} - ${error.message}`);
      }
    }
    
    // Check if new columns were added to recipes table
    try {
      const [columns] = await connection.execute(`SHOW COLUMNS FROM recipes LIKE 'popularity_score'`);
      if (columns.length > 0) {
        console.log('✅ New columns added to recipes table');
      } else {
        console.log('❌ New columns missing from recipes table');
      }
    } catch (error) {
      console.log(`❌ Column verification failed: ${error.message}`);
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successful operations: ${successCount}`);
    console.log(`   ⚠️  Failed operations: ${errorCount}`);
    console.log(`   🎉 Smart Search System migration completed!`);
    
    // Run initial popularity score calculation
    try {
      console.log('\n🔄 Running initial popularity score calculation...');
      await connection.execute('CALL UpdatePopularityScores()');
      console.log('✅ Popularity scores updated');
    } catch (error) {
      console.warn(`⚠️  Initial popularity calculation failed: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
if (require.main === module) {
  console.log('🚀 Starting Smart Search System Migration...\n');
  runMigration().catch(console.error);
}

module.exports = { runMigration };