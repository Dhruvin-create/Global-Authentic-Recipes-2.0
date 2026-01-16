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

async function runLocationMigration() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📖 Reading location migration file...');
    const migrationPath = path.join(__dirname, 'migrations', '003_add_location_fields.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    console.log('🗺️  Running Location and Geocoding migration...');
    
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
          const indexName = statement.match(/create index (?:if not exists )?`?(\w+)`?/i)?.[1];
          console.log(`✅ Created index: ${indexName}`);
        } else if (statement.toLowerCase().includes('insert ignore into country_coordinates')) {
          console.log(`✅ Inserted country coordinates data`);
        }
        
      } catch (error) {
        errorCount++;
        console.warn(`⚠️  Statement failed (continuing): ${error.message}`);
        console.warn(`   Statement: ${statement.substring(0, 100)}...`);
      }
    }
    
    // Handle stored procedures separately
    try {
      console.log('🔧 Creating stored procedures...');
      
      const autoGeocodeProc = `
        DROP PROCEDURE IF EXISTS AutoGeocodeRecipes;
        
        DELIMITER //
        CREATE PROCEDURE AutoGeocodeRecipes(IN batch_size INT DEFAULT 10)
        BEGIN
          DECLARE done INT DEFAULT FALSE;
          DECLARE recipe_id_var INT;
          DECLARE country_name VARCHAR(100);
          DECLARE recipe_region VARCHAR(100);
          DECLARE recipe_city VARCHAR(100);
          DECLARE country_lat DECIMAL(10, 8);
          DECLARE country_lng DECIMAL(11, 8);
          
          DECLARE recipe_cursor CURSOR FOR 
            SELECT r.id, r.origin_country, r.region, r.city
            FROM recipes r
            WHERE r.status = 'published' 
            AND (r.latitude IS NULL OR r.longitude IS NULL)
            AND r.origin_country IS NOT NULL
            LIMIT batch_size;
          
          DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
          
          OPEN recipe_cursor;
          
          recipe_loop: LOOP
            FETCH recipe_cursor INTO recipe_id_var, country_name, recipe_region, recipe_city;
            IF done THEN
              LEAVE recipe_loop;
            END IF;
            
            -- Try to get coordinates from country_coordinates table
            SELECT latitude, longitude INTO country_lat, country_lng
            FROM country_coordinates 
            WHERE country_name = country_name
            LIMIT 1;
            
            -- If found, update recipe with approximate coordinates
            IF country_lat IS NOT NULL AND country_lng IS NOT NULL THEN
              -- Add some randomization to avoid overlapping markers (±1 degree)
              SET country_lat = country_lat + (RAND() - 0.5) * 2;
              SET country_lng = country_lng + (RAND() - 0.5) * 2;
              
              UPDATE recipes 
              SET 
                latitude = country_lat,
                longitude = country_lng,
                location_accuracy = 'approximate',
                geocoded_at = NOW()
              WHERE id = recipe_id_var;
            ELSE
              -- Add to geocoding queue for manual processing
              INSERT IGNORE INTO geocoding_queue (recipe_id, search_address, priority)
              VALUES (
                recipe_id_var, 
                CONCAT_WS(', ', recipe_city, recipe_region, country_name),
                3
              );
            END IF;
            
          END LOOP;
          
          CLOSE recipe_cursor;
        END //
        DELIMITER ;
      `;
      
      await connection.query(autoGeocodeProc);
      console.log('✅ Created stored procedure: AutoGeocodeRecipes');
      
      const distanceFunction = `
        DROP FUNCTION IF EXISTS CalculateDistance;
        
        DELIMITER //
        CREATE FUNCTION CalculateDistance(
          lat1 DECIMAL(10,8), 
          lng1 DECIMAL(11,8), 
          lat2 DECIMAL(10,8), 
          lng2 DECIMAL(11,8)
        ) RETURNS DECIMAL(8,2)
        READS SQL DATA
        DETERMINISTIC
        BEGIN
          DECLARE distance DECIMAL(8,2);
          
          SET distance = (
            6371 * acos(
              cos(radians(lat1)) * cos(radians(lat2)) * 
              cos(radians(lng2) - radians(lng1)) + 
              sin(radians(lat1)) * sin(radians(lat2))
            )
          );
          
          RETURN distance;
        END //
        DELIMITER ;
      `;
      
      await connection.query(distanceFunction);
      console.log('✅ Created function: CalculateDistance');
      
    } catch (error) {
      console.warn(`⚠️  Stored procedure/function creation failed: ${error.message}`);
    }
    
    // Verify migration success
    console.log('\n🔍 Verifying migration...');
    
    const tables = [
      'location_analytics',
      'geocoding_queue', 
      'country_coordinates'
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
      const [columns] = await connection.execute(`SHOW COLUMNS FROM recipes LIKE 'latitude'`);
      if (columns.length > 0) {
        console.log('✅ Location columns added to recipes table');
      } else {
        console.log('❌ Location columns missing from recipes table');
      }
    } catch (error) {
      console.log(`❌ Column verification failed: ${error.message}`);
    }
    
    // Check country coordinates data
    try {
      const [countryRows] = await connection.execute('SELECT COUNT(*) as count FROM country_coordinates');
      const count = countryRows[0].count;
      console.log(`✅ Country coordinates loaded: ${count} countries`);
    } catch (error) {
      console.log(`❌ Country coordinates verification failed: ${error.message}`);
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successful operations: ${successCount}`);
    console.log(`   ⚠️  Failed operations: ${errorCount}`);
    console.log(`   🗺️  Location and geocoding migration completed!`);
    
    // Run initial auto-geocoding
    try {
      console.log('\n🔄 Running initial auto-geocoding...');
      await connection.execute('CALL AutoGeocodeRecipes(50)');
      
      // Check how many recipes were geocoded
      const [geocodedRows] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM recipes 
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      `);
      const geocodedCount = geocodedRows[0].count;
      console.log(`✅ Recipes with coordinates: ${geocodedCount}`);
      
    } catch (error) {
      console.warn(`⚠️  Initial auto-geocoding failed: ${error.message}`);
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
  console.log('🗺️  Starting Location and Geocoding Migration...\n');
  runLocationMigration().catch(console.error);
}

module.exports = { runLocationMigration };