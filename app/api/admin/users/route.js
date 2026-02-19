// Admin User Management API Route
// GET /api/admin/users - Get all users (Admin only)
// PUT /api/admin/users - Update user role/status (Admin only)

import {
  successResponse,
  paginatedResponse,
  errorResponse,
  validationError,
  withErrorHandling,
  validateMethod,
  parseRequestBody,
  validateRequiredFields,
  sanitizeString,
  validatePagination
} from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

// GET - Get all users with pagination and filters
async function getUsersHandler(request) {
  validateMethod(request, ['GET']);

  // Require admin authentication
  await requireAdmin(request);

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = validatePagination(searchParams);

  // Filter parameters
  const role = searchParams.get('role');
  const verified = searchParams.get('verified');
  const search = searchParams.get('search');

  // Build WHERE clause
  let whereConditions = [];
  let queryParams = [];

  if (role && ['USER', 'ADMIN'].includes(role)) {
    whereConditions.push('u.role = ?');
    queryParams.push(role);
  }

  if (verified === 'true' || verified === 'false') {
    whereConditions.push('u.is_verified = ?');
    queryParams.push(verified === 'true' ? 1 : 0);
  }

  if (search) {
    whereConditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  try {
    // Get total count - use separate params for count query
    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const countParams = [...queryParams]; // Clone array
    const [{ total }] = await executeQuery(countQuery, countParams);

    // Get users with pagination - use separate params for users query
    const usersQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.avatar,
        u.role,
        u.auth_provider,
        u.is_verified,
        u.created_at,
        u.last_login_at,
        ua.recipes_created,
        ua.reviews_written,
        ua.likes_given,
        ua.favorites_count,
        ua.playlists_count
      FROM users u
      LEFT JOIN user_activity ua ON u.id = ua.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Params for WHERE clause only
    const usersParams = [...queryParams];

    const users = await executeQuery(usersQuery, usersParams);

    return paginatedResponse(users, { page, limit, total });

  } catch (error) {
    throw error;
  }
}

// PUT - Update user role or status
async function updateUserHandler(request) {
  validateMethod(request, ['PUT']);

  // Require admin authentication
  const admin = await requireAdmin(request);

  // Parse request body
  const body = await parseRequestBody(request);

  // Validate required fields
  validateRequiredFields(body, ['userId']);

  const userId = sanitizeString(body.userId);
  const role = body.role;
  const isVerified = body.isVerified;

  // Validate role if provided
  if (role && !['USER', 'ADMIN'].includes(role)) {
    return validationError({
      role: 'Role must be either USER or ADMIN'
    });
  }

  // Validate isVerified if provided
  if (isVerified !== undefined && typeof isVerified !== 'boolean') {
    return validationError({
      isVerified: 'isVerified must be a boolean'
    });
  }

  try {
    // Check if user exists
    const users = await executeQuery(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return errorResponse('User not found', 404);
    }

    const user = users[0];

    // Prevent admin from demoting themselves
    if (user.id === admin.id && role === 'USER') {
      return errorResponse('You cannot demote yourself from admin role', 400);
    }

    // Build update query
    const updates = [];
    const params = [];

    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (isVerified !== undefined) {
      updates.push('is_verified = ?');
      params.push(isVerified);
    }

    if (updates.length === 0) {
      return validationError({
        general: 'No valid fields provided for update'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(userId);

    // Execute update
    await executeQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated user
    const updatedUsers = await executeQuery(
      'SELECT id, name, email, phone, role, is_verified FROM users WHERE id = ?',
      [userId]
    );

    return successResponse({
      user: updatedUsers[0]
    }, 'User updated successfully');

  } catch (error) {
    throw error;
  }
}

// Export handlers
export const GET = withErrorHandling(getUsersHandler);
export const PUT = withErrorHandling(updateUserHandler);