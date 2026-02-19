// Verify Account API Route
// POST /api/auth/verify
// Verify user account with verification token

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
import { executeQuery } from '@/lib/database';

async function verifyAccountHandler(request) {
  // Validate HTTP method
  validateMethod(request, ['POST']);
  
  // Parse request body
  const body = await parseRequestBody(request);
  
  // Validate required fields
  validateRequiredFields(body, ['token']);
  
  // Sanitize inputs
  const token = sanitizeString(body.token);
  
  if (!token || token.length < 10) {
    return validationError({
      token: 'Invalid verification token'
    });
  }
  
  try {
    // Find user with verification token
    const users = await executeQuery(
      'SELECT id, name, email, phone, is_verified FROM users WHERE verification_token = ?',
      [token]
    );
    
    if (users.length === 0) {
      return errorResponse('Invalid or expired verification token', 400);
    }
    
    const user = users[0];
    
    if (user.is_verified) {
      return errorResponse('Account is already verified', 400);
    }
    
    // Update user as verified and remove verification token
    await executeQuery(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?',
      [user.id]
    );
    
    return successResponse({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    }, 'Account verified successfully. You can now login.');
    
  } catch (error) {
    throw error;
  }
}

// Export with error handling
export const POST = withErrorHandling(verifyAccountHandler);