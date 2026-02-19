// Forgot Password API Route
// POST /api/auth/forgot-password
// Send password reset token to user

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
  isValidEmail, 
  isValidPhone,
  generateVerificationToken
} from '@/lib/auth';
import { executeQuery } from '@/lib/database';

async function forgotPasswordHandler(request) {
  // Validate HTTP method
  validateMethod(request, ['POST']);
  
  // Parse request body
  const body = await parseRequestBody(request);
  
  // Validate required fields
  validateRequiredFields(body, ['identifier']);
  
  // Sanitize inputs
  const identifier = sanitizeString(body.identifier);
  
  // Validate identifier format
  if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
    return validationError({
      identifier: 'Please provide a valid email address or phone number'
    });
  }
  
  try {
    let user;
    
    // Find user by email or phone
    if (isValidEmail(identifier)) {
      const users = await executeQuery(
        'SELECT id, name, email, is_verified FROM users WHERE email = ? AND auth_provider = ?',
        [identifier, 'EMAIL']
      );
      user = users[0];
    } else {
      const users = await executeQuery(
        'SELECT id, name, phone, is_verified FROM users WHERE phone = ? AND auth_provider = ?',
        [identifier, 'PHONE']
      );
      user = users[0];
    }
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return successResponse(
        null,
        'If an account with this email/phone exists, you will receive a password reset link.'
      );
    }
    
    if (!user.is_verified) {
      return errorResponse('Please verify your account first', 400);
    }
    
    // Generate reset token and expiry (24 hours)
    const resetToken = generateVerificationToken();
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Update user with reset token
    await executeQuery(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );
    
    // TODO: Send email/SMS with reset token
    // For now, return token in response (remove in production)
    return successResponse({
      resetToken, // Remove this in production
      message: 'Password reset instructions sent to your email/phone'
    }, 'Password reset link sent successfully');
    
  } catch (error) {
    throw error;
  }
}

// Export with error handling
export const POST = withErrorHandling(forgotPasswordHandler);