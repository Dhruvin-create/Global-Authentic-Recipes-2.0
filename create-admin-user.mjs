import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const dbConfig = {
  host: 'switchback.proxy.rlwy.net',
  port: 20721,
  user: 'root',
  password: 'wBYdYMSqohVekErTKnqknEFScPkhkrEc',
  database: 'railway'
};

async function createAdminUser() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('👤 Creating admin user...\n');

    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await connection.execute(
      `INSERT INTO users (
        id, username, first_name, last_name, email, password, 
        role, is_verified, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        'admin',
        'Admin',
        'User',
        'admin@globalrecipes.com',
        hashedPassword,
        'SUPER_ADMIN',
        true
      ]
    );

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Username: admin');
    console.log('Email: admin@globalrecipes.com');
    console.log('Password: admin123');
    console.log('Role: SUPER_ADMIN');
    console.log(`\nUser ID: ${userId}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connection closed');
    }
    process.exit(0);
  }
}

createAdminUser();
