// Setup Admin User API (ONE-TIME USE)
// GET /api/setup-admin - Create admin user if not exists

import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-response';
import { executeQuery } from '@/lib/database';
import bcrypt from 'bcryptjs';

async function setupAdminHandler(request) {
  try {
    // Check if admin already exists
    const existing = await executeQuery(
      'SELECT id FROM users WHERE role = "SUPER_ADMIN" LIMIT 1'
    );
    
    if (existing && existing.length > 0) {
      return successResponse({ 
        message: 'Admin user already exists',
        userId: existing[0].id 
      });
    }
    
    // Create admin user
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await executeQuery(
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
    
    return successResponse({
      message: 'Admin user created successfully',
      userId,
      credentials: {
        username: 'admin',
        email: 'admin@globalrecipes.com',
        password: 'admin123',
        role: 'SUPER_ADMIN'
      }
    }, 'Admin user created', 201);
    
  } catch (error) {
    return errorResponse(`Setup failed: ${error.message}`, 500);
  }
}

export const GET = withErrorHandling(setupAdminHandler);
