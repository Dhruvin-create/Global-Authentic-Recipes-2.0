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
  createUser,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidUsername
} from '@/lib/auth';

async function registerHandler(request) {
  // Validate HTTP method
  validateMethod(request, ['POST']);

  // Parse request body
  const body = await parseRequestBody(request);

  // Log received data for debugging
  console.log('📝 Registration request received:', {
    username: body.username,
    firstName: body.firstName,
    lastName: body.lastName,
    hasEmail: !!body.email,
    hasPhone: !!body.phone,
    hasPassword: !!body.password
  });

  // Validate required fields
  try {
    validateRequiredFields(body, ['username', 'firstName', 'lastName', 'password']);
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return validationError({
      general: 'Required fields missing: username, firstName, lastName, and password are required'
    });
  }

  // At least one of email or phone must be provided
  if (!body.email && !body.phone) {
    return validationError({
      general: 'At least one of email or phone number is required'
    });
  }

  // Sanitize inputs
  const username = sanitizeString(body.username).toLowerCase();
  const firstName = sanitizeString(body.firstName);
  const lastName = sanitizeString(body.lastName);
  const password = body.password;

  // Validate username
  if (!isValidUsername(username)) {
    return validationError({
      username: 'Username must be 3-50 characters and contain only letters, numbers, and underscores'
    });
  }

  // Validate first name
  if (firstName.length < 2 || firstName.length > 100) {
    return validationError({
      firstName: 'First name must be between 2 and 100 characters'
    });
  }

  // Validate last name
  if (lastName.length < 2 || lastName.length > 100) {
    return validationError({
      lastName: 'Last name must be between 2 and 100 characters'
    });
  }

  // Validate password strength
  if (!isValidPassword(password)) {
    return validationError({
      password: 'Password must be at least 8 characters'
    });
  }

  let email = null;
  let phone = null;
  let authProvider = null;

  // Validate email if provided
  if (body.email) {
    email = sanitizeString(body.email).toLowerCase();
    if (!isValidEmail(email)) {
      return validationError({
        email: 'Please provide a valid email address'
      });
    }
    authProvider = 'EMAIL';
  }

  // Validate phone if provided
  if (body.phone) {
    phone = sanitizeString(body.phone);
    if (!isValidPhone(phone)) {
      return validationError({
        phone: 'Please provide a valid phone number (+91XXXXXXXXXX)'
      });
    }
    // If both email and phone provided, prefer email as primary auth
    if (!authProvider) {
      authProvider = 'PHONE';
    }
  }

  try {
    // Create user
    const result = await createUser({
      username,
      email,
      phone,
      password,
      firstName,
      lastName,
      authProvider
    });

    return successResponse({
      userId: result.userId,
      username,
      verificationToken: result.verificationToken, // Remove in production, send via email/SMS
      message: 'Account created successfully. Please verify your account to login.'
    }, 'Registration successful', 201);

  } catch (error) {
    // Handle specific creation errors
    if (error.message.includes('already exists')) {
      return errorResponse(error.message, 409);
    }

    throw error; // Let withErrorHandling handle other errors
  }
}

// Export with error handling
export const POST = withErrorHandling(registerHandler);
