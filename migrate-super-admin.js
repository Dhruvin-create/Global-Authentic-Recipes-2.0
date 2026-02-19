const db = require('./lib/database');
const bcrypt = require('bcryptjs');

async function migrate() {
  console.log('🚀 Adding SUPER_ADMIN role...\n');
  
  try {
    // Step 1: Alter table to add SUPER_ADMIN to enum
    console.log('Step 1: Updating role enum...');
    await db.executeQuery(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER'
    `);
    console.log('✅ Role enum updated\n');
    
    // Step 2: Create super admin user
    console.log('Step 2: Creating super admin user...');
    const password = 'SuperAdmin@123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.executeQuery(`
      INSERT INTO users (
        id, email, password, name, role, auth_provider, is_verified, created_at
      ) VALUES (
        UUID(),
        'superadmin@globalrecipes.com',
        ?,
        'Super Administrator',
        'SUPER_ADMIN',
        'EMAIL',
        TRUE,
        NOW()
      )
    `, [hashedPassword]);
    console.log('✅ Super admin created\n');
    
    // Step 3: Create role_change_logs table
    console.log('Step 3: Creating role_change_logs table...');
    await db.executeQuery(`
      CREATE TABLE IF NOT EXISTS role_change_logs (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        old_role ENUM('USER', 'ADMIN', 'SUPER_ADMIN'),
        new_role ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL,
        changed_by VARCHAR(36),
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Audit table created\n');
    
    // Verify
    console.log('📊 Verification:\n');
    const users = await db.executeQuery(`
      SELECT email, name, role, is_verified
      FROM users
      ORDER BY 
        CASE role
          WHEN 'SUPER_ADMIN' THEN 1
          WHEN 'ADMIN' THEN 2
          WHEN 'USER' THEN 3
        END
    `);
    
    console.table(users);
    
    console.log('\n✅ Migration completed successfully!\n');
    console.log('🔐 Super Admin Login:');
    console.log('   Email: superadmin@globalrecipes.com');
    console.log('   Password: SuperAdmin@123\n');
    
  } catch (error) {
    if (error.message.includes('Duplicate entry')) {
      console.log('⚠️  Super admin already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
