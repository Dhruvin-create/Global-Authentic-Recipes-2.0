// Self-Service Profile Update API
// PUT /api/auth/update-profile - Update own profile (username, email, phone)

import {
  successResponse,
  errorResponse,
  validationError,
  withErrorHandling,
  validateMethod,
  parseRequestBody,
  sanitizeString
} from '@/lib/api-response';
import { requireAuth, isValidEmail, isValidPhone, isValidUsername } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

async function updateProfileHandler(request) {
  validateMethod(request, ['PUT']);

  // Require authentication
  const user = await requireAuth(request);

  // Parse request body
  const body = await parseRequestBody(request);

  const username = body.username ? sanitizeString(body.username).toLowerCase() : null;
  const email = body.email ? sanitizeString(body.email).toLowerCase() : null;
  const phone = body.phone ? sanitizeString(body.phone) : null;
  const firstName = body.firstName ? sanitizeString(body.firstName) : null;
  const lastName = body.lastName ? sanitizeString(body.lastName) : null;

  // Validate username if provided
  if (username && !isValidUsername(username)) {
    return validationError({
      username: 'Username must be 3-50 characters and contain only letters, numbers, and underscores'
    });
  }

  // Validate email if provided
  if (email && !isValidEmail(email)) {
    return validationError({
      email: 'Please provide a valid email address'
    });
  }

  // Validate phone if provided
  if (phone && !isValidPhone(phone)) {
    return validationError({
      phone: 'Please provide a valid phone number (+91XXXXXXXXXX)'
    });
  }

  try {
    // Check if username already exists
    if (username) {
      const existingUser = await executeQuery(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, user.id]
      );
      if (existingUser.length > 0) {
        return validationError({ username: 'Username already exists' });
      }
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await executeQuery(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, user.id]
      );
      if (existingEmail.length > 0) {
        return validationError({ email: 'Email already exists' });
      }
    }

    // Check if phone already exists
    if (phone) {
      const existingPhone = await executeQuery(
        'SELECT id FROM users WHERE phone = ? AND id != ?',
        [phone, user.id]
      );
      if (existingPhone.length > 0) {
        return validationError({ phone: 'Phone number already exists' });
      }
    }

    // Build update query
    const updates = [];
    const params = [];

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
      const currentUser = await executeQuery('SELECT first_name, last_name FROM users WHERE id = ?', [user.id]);
      const newFirstName = firstName || currentUser[0].first_name;
      const newLastName = lastName || currentUser[0].last_name;
      updates.push('name = ?');
      params.push(`${newFirstName} ${newLastName}`);
    }

    if (updates.length === 0) {
      return validationError({
        general: 'No valid fields provided for update'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(user.id);

    // Execute update
    await executeQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated user
    const updatedUsers = await executeQuery(
      'SELECT id, username, name, first_name, last_name, email, phone, role, is_verified FROM users WHERE id = ?',
      [user.id]
    );

    return successResponse({
      user: updatedUsers[0]
    }, 'Profile updated successfully');

  } catch (error) {
    throw error;
  }
}

export const PUT = withErrorHandling(updateProfileHandler);
