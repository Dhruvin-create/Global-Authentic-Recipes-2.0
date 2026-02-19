import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'global_recipes',
  charset: 'utf8mb4',
  timezone: '+00:00',
  // Connection pool settings
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 20000, // 20 seconds
};


// Create connection pool
let pool;

function createPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('✅ MySQL connection pool created');
  }
  return pool;
}

// Get database connection
async function getConnection() {
  try {
    const pool = createPool();
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

// Execute query with automatic connection management
async function executeQuery(query, params = []) {
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Query execution failed:', error.message);
    console.error('Query:', query);
    console.error('Params:', params);
    throw new Error(`Query execution failed: ${error.message}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Execute multiple queries in a transaction
async function executeTransaction(queries) {
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }

    await connection.commit();
    return results;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('❌ Transaction failed:', error.message);
    throw new Error(`Transaction failed: ${error.message}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Test database connection
async function testConnection() {
  try {
    const result = await executeQuery('SELECT 1 as test');
    console.log('✅ Database connection test successful');
    return { success: true, message: 'Database connected successfully' };
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return { success: false, message: error.message };
  }
}

// Get database statistics
async function getDatabaseStats() {
  try {
    const stats = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') as admin_users,
        (SELECT COUNT(*) FROM recipes) as total_recipes,
        (SELECT COUNT(*) FROM recipes WHERE is_published = TRUE) as published_recipes,
        (SELECT COUNT(*) FROM cuisines) as total_cuisines,
        (SELECT COUNT(*) FROM reviews) as total_reviews,
        (SELECT COUNT(*) FROM likes) as total_likes,
        (SELECT COUNT(*) FROM favorites) as total_favorites
    `);
    return stats[0];
  } catch (error) {
    console.error('❌ Failed to get database stats:', error.message);
    throw error;
  }
}

// Close all connections (for graceful shutdown)
async function closeConnections() {
  if (pool) {
    await pool.end();
    console.log('✅ Database connections closed');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connections...');
  await closeConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Closing database connections...');
  await closeConnections();
  process.exit(0);
});

export {
  getConnection,
  executeQuery,
  executeTransaction,
  testConnection,
  getDatabaseStats,
  closeConnections
};
