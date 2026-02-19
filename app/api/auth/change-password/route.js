// Change Password API Route
// POST /api/auth/change-password
// Change password for authenticated user

import { 
  successResponse,
  errorResponse,
  validationError,
  withErrorHandling,
  validateMethod,
  parseRequestBody,
  validateRequiredFields
} from '@/lib/api-response';
import { 
  requireAuth,
  verifyPassword,
  hashPassword,
  isValidPassword
} from '@/lib/auth';
import { executeQuery } from '@/lib/database';

async function changePasswordHandler(request) {
  // Validate HTTP method
  validateMethod(request, ['POST']);
  
  // Require authentication
  const user = await requireAuth(request);
  
  // Parse request body
  const body = await parseRequestBody(request);
  
  // Validate required fields
  validateRequiredFields(body, ['currentPassword', 'newPassword']);
  
  const currentPassword = body.currentPassword;
  const newPassword = body.newPassword;
  
  // Validate new password strength
  if (!isValidPassword(newPassword)) {
    return validationError({
      newPassword: 'Password must be at least 8 characters with uppercase, lowercase, and number'
    });
  }
  
  // Check if new password is different from current
  if (currentPassword === newPassword) {
    return validationError({
      newPassword: 'New password must be different from current password'
    });
  }
  
  try {
    // Get user's current password hash
    const users = await executeQuery(
      'SELECT password FROM users WHERE id = ?',
      [user.id]
    );
    
    if (users.length === 0) {
      return errorResponse('User not found', 404);
    }
    
    const currentPasswordHash = users[0].password;
    
    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, currentPasswordHash);
    if (!isCurrentPasswordValid) {
      return errorResponse('Current password is incorrect', 400);
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update password
    await executeQuery(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPasswordHash, user.id]
    );
    
    return successResponse(
      null,
      'Password changed successfully'
    );
    
  } catch (error) {
    throw error;
  }
}

// Export with error handling
export const POST = withErrorHandling(changePasswordHandler);