// Reset Password API Route
// POST /api/auth/reset-password - Reset password without old password

import {
  successResponse,
  errorResponse,
  validationError,
  withErrorHandling,
  validateMethod,
  parseRequestBody,
  validateRequiredFields,
  sanitizeString
} from '@/lib/api-response';
import { getUserByEmail, getUserByPhone, getUserByUsername, hashPassword, isValidEmail, isValidPhone, isValidPassword } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

async function resetPasswordHandler(request) {
  validateMethod(request, ['POST']);

  const body = await parseRequestBody(request);
  validateRequiredFields(body, ['identifier', 'newPassword']);

  const identifier = sanitizeString(body.identifier);
  const newPassword = body.newPassword;

  // Validate new password
  if (!isValidPassword(newPassword)) {
    return validationError({
      newPassword: 'Password must be at least 8 characters long'
    });
  }

  try {
    let user;

    // Find user by email, phone, or username
    if (isValidEmail(identifier)) {
      user = await getUserByEmail(identifier);
    } else if (isValidPhone(identifier)) {
      user = await getUserByPhone(identifier);
    } else {
      user = await getUserByUsername(identifier);
    }

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await executeQuery(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, user.id]
    );

    return successResponse(
      { message: 'Password has been reset successfully' },
      'Password reset successful'
    );

  } catch (error) {
    throw error;
  }
}

export const POST = withErrorHandling(resetPasswordHandler);
