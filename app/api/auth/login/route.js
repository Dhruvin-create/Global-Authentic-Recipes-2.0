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
  authenticateUser,
  isValidEmail,
  isValidPhone
} from '@/lib/auth';

async function loginHandler(request) {
  // Validate HTTP method
  validateMethod(request, ['POST']);

  // Parse request body
  const body = await parseRequestBody(request);

  // Validate required fields
  validateRequiredFields(body, ['identifier', 'password']);

  // Sanitize inputs
  const identifier = sanitizeString(body.identifier);
  const password = body.password;

  // Validate identifier format
  if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
    return validationError({
      identifier: 'Please provide a valid email address or phone number (+91XXXXXXXXXX)'
    });
  }

  // Validate password
  if (!password || password.length < 6) {
    return validationError({
      password: 'Password must be at least 6 characters long'
    });
  }

  try {
    // Authenticate user
    const result = await authenticateUser(identifier, password);


    return successResponse({
      user: result.user,
      token: result.token
    }, 'Login successful');

  } catch (error) {
    // Handle authentication errors
    if (error.message.includes('User not found')) {
      return errorResponse('Invalid credentials', 401);
    }

    if (error.message.includes('Invalid password')) {
      return errorResponse('Invalid credentials', 401);
    }

    if (error.message.includes('verify your account')) {
      return errorResponse('Please verify your account first', 403);
    }

    throw error; // Let withErrorHandling handle other errors
  }
}

// Export with error handling
export const POST = withErrorHandling(loginHandler);
