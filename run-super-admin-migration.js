// Run Super Admin Migration
const fs = require('fs');
const db = require('./lib/database');

async function runMigration() {
  console.log('🚀 Starting SUPER_ADMIN migration...\n');
  
  try {
    const migrationSQL = fs.readFileSync('database/migration-add-super-admin.sql', 'utf8');
    
    // Split by semicolon and filter empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    for (const statement of statements) {
      // Skip comments and SELECT statements for display
      if (statement.includes('SELECT') && statement.includes('status')) {
        continue;
      }
      
      try {
        await db.executeQuery(statement);
        console.log('✅ Executed:', statement.substring(0, 60) + '...');
      } catch (error) {
        // Ignore duplicate key errors for idempotency
        if (!error.message.includes('Duplicate entry')) {
          console.error('❌ Error:', error.message);
        }
      }
    }
    
    // Verify the migration
    console.log('\n📊 Verifying migration...\n');
    const users = await db.executeQuery(`
      SELECT 
        id,
        email,
        name,
        role,
        is_verified,
        created_at
      FROM users
      ORDER BY 
        CASE role
          WHEN 'SUPER_ADMIN' THEN 1
          WHEN 'ADMIN' THEN 2
          WHEN 'USER' THEN 3
        END,
        created_at
    `);
    
    console.log('Users in database:');
    console.table(users.map(u => ({
      Email: u.email,
      Name: u.name,
      Role: u.role,
      Verified: u.is_verified ? 'Yes' : 'No'
    })));
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n🔐 Super Admin Credentials:');
    console.log('   Email: superadmin@globalrecipes.com');
    console.log('   Password: SuperAdmin@123');
    console.log('\n⚠️  IMPORTANT: Change the email in migration file to your real email!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
