// Admin User Management API Route
// GET /api/admin/users - Get all users (Admin only)
// PUT /api/admin/users - Update user role/status (Admin only)
// DELETE /api/admin/users - Delete user (Super Admin only)

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
import { requireAdmin, requireSuperAdmin } from '@/lib/auth';
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

  if (role && ['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    whereConditions.push('u.role = ?');
    queryParams.push(role);
  }

  if (verified === 'true' || verified === 'false') {
    whereConditions.push('u.is_verified = ?');
    queryParams.push(verified === 'true' ? 1 : 0);
  }

  if (search) {
    whereConditions.push('(u.name LIKE ? OR u.username LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  try {
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const countParams = [...queryParams];
    const [{ total }] = await executeQuery(countQuery, countParams);

    // Get users with pagination
    const usersQuery = `
      SELECT 
        u.id,
        u.username,
        u.name,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar,
        u.role,
        u.auth_provider,
        u.is_verified,
        u.created_at,
        u.last_login_at
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const usersParams = [...queryParams];
    const users = await executeQuery(usersQuery, usersParams);

    return paginatedResponse(users, { page, limit, total });

  } catch (error) {
    throw error;
  }
}

// PUT - Update user role, status, or details
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
  const username = body.username ? sanitizeString(body.username) : null;
  const email = body.email ? sanitizeString(body.email).toLowerCase() : null;
  const phone = body.phone ? sanitizeString(body.phone) : null;
  const firstName = body.firstName ? sanitizeString(body.firstName) : null;
  const lastName = body.lastName ? sanitizeString(body.lastName) : null;

  // Validate role if provided
  if (role && !['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return validationError({
      role: 'Role must be USER, ADMIN, or SUPER_ADMIN'
    });
  }

  // Only Super Admin can assign SUPER_ADMIN role
  if (role === 'SUPER_ADMIN' && admin.role !== 'SUPER_ADMIN') {
    return errorResponse('Only Super Admin can assign Super Admin role', 403);
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
      'SELECT id, username, name, email, phone, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return errorResponse('User not found', 404);
    }

    const user = users[0];

    // Prevent admin from demoting themselves
    if (user.id === admin.id && role && role !== admin.role) {
      return errorResponse('You cannot change your own role', 400);
    }

    // Check if username already exists (if changing)
    if (username && username !== user.username) {
      const existingUser = await executeQuery(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      if (existingUser.length > 0) {
        return validationError({ username: 'Username already exists' });
      }
    }

    // Check if email already exists (if changing)
    if (email && email !== user.email) {
      const existingEmail = await executeQuery(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (existingEmail.length > 0) {
        return validationError({ email: 'Email already exists' });
      }
    }

    // Check if phone already exists (if changing)
    if (phone && phone !== user.phone) {
      const existingPhone = await executeQuery(
        'SELECT id FROM users WHERE phone = ? AND id != ?',
        [phone, userId]
      );
      if (existingPhone.length > 0) {
        return validationError({ phone: 'Phone number already exists' });
      }
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

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (phone) {
      updates.push('phone = ?');
      params.push(phone);
    }

    if (firstName) {
      updates.push('first_name = ?');
      params.push(firstName);
    }

    if (lastName) {
      updates.push('last_name = ?');
      params.push(lastName);
    }

    // Update full name if first or last name changed
    if (firstName || lastName) {
      const newFirstName = firstName || user.name.split(' ')[0];
      const newLastName = lastName || user.name.split(' ').slice(1).join(' ');
      updates.push('name = ?');
      params.push(`${newFirstName} ${newLastName}`);
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
      'SELECT id, username, name, first_name, last_name, email, phone, role, is_verified FROM users WHERE id = ?',
      [userId]
    );

    return successResponse({
      user: updatedUsers[0]
    }, 'User updated successfully');

  } catch (error) {
    throw error;
  }
}

// DELETE - Delete user (Super Admin only)
async function deleteUserHandler(request) {
  validateMethod(request, ['DELETE']);

  // Require Super Admin authentication
  const admin = await requireSuperAdmin(request);

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return validationError({ userId: 'User ID is required' });
  }

  try {
    // Check if user exists
    const users = await executeQuery(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return errorResponse('User not found', 404);
    }

    const user = users[0];

    // Prevent deleting yourself
    if (user.id === admin.id) {
      return errorResponse('You cannot delete your own account', 400);
    }

    // Delete user (CASCADE will handle related records)
    await executeQuery('DELETE FROM users WHERE id = ?', [userId]);

    return successResponse({
      deletedUser: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }, 'User deleted successfully');

  } catch (error) {
    throw error;
  }
}

// Export handlers
export const GET = withErrorHandling(getUsersHandler);
export const PUT = withErrorHandling(updateUserHandler);
export const DELETE = withErrorHandling(deleteUserHandler);