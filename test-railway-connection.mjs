import mysql from 'mysql2/promise';

// Railway PUBLIC credentials
const config = {
  host: 'containers-us-west-xxx.railway.app',
  port: 15180,
  user: 'root',
  password: 'OvGwGlQBQtQKQRmzAfRElxjVkACpPvGv',
  database: 'railway',
  connectTimeout: 30000,
};

async function testConnection() {
  console.log('🔄 Testing Railway database connection...\n');
  console.log('Config:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
    password: '***' + config.password.slice(-4)
  });
  
  try {
    console.log('\n⏳ Connecting...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to Railway database!\n');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Query successful:', rows[0]);
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Tables in database:', tables.length);
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    
    await connection.end();
    console.log('\n✅ Connection test successful!');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Wrong host/password - Check Railway dashboard Variables tab');
    console.error('2. Firewall blocking - Railway should allow all IPs by default');
    console.error('3. Database not running - Check Railway dashboard');
    console.error('4. Network issue - Try again or use VPN');
  }
  
  process.exit(0);
}

testConnection();
