// Test Database Connection API
// GET /api/test-db - Test database connection and basic queries

import { 
  successResponse,
  errorResponse,
  withErrorHandling,
  validateMethod
} from '@/lib/api-response';
import { executeQuery, testConnection, getDatabaseStats } from '@/lib/database';

async function testDatabaseHandler(request) {
  validateMethod(request, ['GET']);
  
  try {
    // Test basic connection
    const connectionTest = await testConnection();
    
    if (!connectionTest.success) {
      return errorResponse(`Database connection failed: ${connectionTest.message}`, 500);
    }
    
    // Test basic query
    const basicTest = await executeQuery('SELECT 1 as test, NOW() as db_time');
    
    // Test recipes table
    let recipesTest = null;
    try {
      recipesTest = await executeQuery('SELECT COUNT(*) as count FROM recipes');
    } catch (error) {
      recipesTest = { error: error.message };
    }
    
    // Test cuisines table
    let cuisinesTest = null;
    try {
      cuisinesTest = await executeQuery('SELECT COUNT(*) as count FROM cuisines');
    } catch (error) {
      cuisinesTest = { error: error.message };
    }
    
    // Test users table
    let usersTest = null;
    try {
      usersTest = await executeQuery('SELECT COUNT(*) as count FROM users');
    } catch (error) {
      usersTest = { error: error.message };
    }
    
    // Get database stats if possible
    let stats = null;
    try {
      stats = await getDatabaseStats();
    } catch (error) {
      stats = { error: error.message };
    }
    
    // Environment check
    const envCheck = {
      DB_HOST: process.env.DB_HOST ? 'Set' : 'Missing',
      DB_PORT: process.env.DB_PORT ? 'Set' : 'Missing',
      DB_USER: process.env.DB_USER ? 'Set' : 'Missing',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'Set' : 'Missing',
      DB_NAME: process.env.DB_NAME ? 'Set' : 'Missing',
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
      NODE_ENV: process.env.NODE_ENV || 'Not Set'
    };
    
    return successResponse({
      connection: connectionTest,
      basicQuery: basicTest[0],
      tables: {
        recipes: recipesTest,
        cuisines: cuisinesTest,
        users: usersTest
      },
      stats,
      environment: envCheck,
      timestamp: new Date().toISOString()
    }, 'Database test completed');
    
  } catch (error) {
    return errorResponse(`Database test failed: ${error.message}`, 500);
  }
}

export const GET = withErrorHandling(testDatabaseHandler);