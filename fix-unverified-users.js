// Fix unverified users - set all users to verified
import { executeQuery } from './lib/database.js';

async function fixUnverifiedUsers() {
  try {
    console.log('🔧 Fixing unverified users...');
    
    // Update all unverified users to verified
    const result = await executeQuery(
      'UPDATE users SET is_verified = TRUE WHERE is_verified = FALSE'
    );
    
    console.log(`✅ Updated ${result.affectedRows} users to verified status`);
    
    // Show current user status
    const users = await executeQuery(
      'SELECT username, email, role, is_verified FROM users ORDER BY created_at'
    );
    
    console.log('\n📊 Current user status:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.role} - ${user.is_verified ? '✅ Verified' : '❌ Unverified'}`);
    });
    
    console.log('\n🎉 All users are now verified and can login!');
    
  } catch (error) {
    console.error('❌ Error fixing users:', error.message);
  } finally {
    process.exit(0);
  }
}

fixUnverifiedUsers();