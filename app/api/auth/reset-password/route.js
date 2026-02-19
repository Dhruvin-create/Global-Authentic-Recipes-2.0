// Reset Password API Route
// POST /api/auth/reset-password
// Reset user password with reset token

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
import { 
  hashPassword,
  isValidPassword
} from '@/lib/auth';
import { executeQuery } from '@/lib/database';

async function resetPasswordHandler(request) {
  // Validate HTTP method
  validateMethod(request, ['POST']);
  
  // Parse request body
  const body = await parseRequestBody(request);
  
  // Validate required fields
  validateRequiredFields(body, ['token', 'newPassword']);
  
  // Sanitize inputs
  const token = sanitizeString(body.token);
  const newPassword = body.newPassword;
  
  // Validate token
  if (!token || token.length < 10) {
    return validationError({
      token: 'Invalid reset token'
    });
  }
  
  // Validate password strength
  if (!isValidPassword(newPassword)) {
    return validationError({
      newPassword: 'Password must be at least 8 characters with uppercase, lowercase, and number'
    });
  }
  
  try {
    // Find user with valid reset token
    const users = await executeQuery(
      'SELECT id, name, email, phone, reset_token_expiry FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    
    if (users.length === 0) {
      return errorResponse('Invalid or expired reset token', 400);
    }
    
    const user = users[0];
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password and clear reset token
    await executeQuery(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    return successResponse({
      userId: user.id,
      name: user.name
    }, 'Password reset successfully. You can now login with your new password.');
    
  } catch (error) {
    throw error;
  }
}

// Export with error handling
export const POST = withErrorHandling(resetPasswordHandler);