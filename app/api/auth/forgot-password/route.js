// Forgot Password API Route
// POST /api/auth/forgot-password - Verify user exists for password reset

import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateMethod,
  parseRequestBody,
  validateRequiredFields,
  sanitizeString
} from '@/lib/api-response';
import { getUserByEmail, getUserByPhone, getUserByUsername, isValidEmail, isValidPhone } from '@/lib/auth';

async function forgotPasswordHandler(request) {
  validateMethod(request, ['POST']);

  const body = await parseRequestBody(request);
  validateRequiredFields(body, ['identifier']);

  const identifier = sanitizeString(body.identifier);

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
      return errorResponse('User not found with this email, username, or phone', 404);
    }

    // Return success (user can now set new password)
    return successResponse({
      message: 'User found. You can now set a new password.'
    }, 'Account verified');

  } catch (error) {
    throw error;
  }
}

export const POST = withErrorHandling(forgotPasswordHandler);
