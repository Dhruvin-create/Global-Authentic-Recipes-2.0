import { NextResponse } from 'next/server';

// Success response
function successResponse(data = null, message = 'Success', status = 200) {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  }, { status });
}

// Error response
function errorResponse(message = 'Internal Server Error', status = 500, errors = null) {
  return NextResponse.json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  }, { status });
}

// Validation error response
function validationError(errors, message = 'Validation failed') {
  return NextResponse.json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  }, { status: 400 });
}

// Unauthorized response
function unauthorizedResponse(message = 'Unauthorized access') {
  return NextResponse.json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  }, { status: 401 });
}

// Forbidden response
function forbiddenResponse(message = 'Access forbidden') {
  return NextResponse.json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  }, { status: 403 });
}

// Not found response
function notFoundResponse(message = 'Resource not found') {
  return NextResponse.json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  }, { status: 404 });
}

// Method not allowed response
function methodNotAllowedResponse(allowedMethods = []) {
  return NextResponse.json({
    success: false,
    message: 'Method not allowed',
    allowedMethods,
    timestamp: new Date().toISOString()
  }, {
    status: 405,
    headers: {
      'Allow': allowedMethods.join(', ')
    }
  });
}

// Paginated response
function paginatedResponse(data, pagination, message = 'Success') {
  return NextResponse.json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
}

// Handle async API route with error catching
function withErrorHandling(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);

      // Handle specific error types
      if (error.message.includes('Authentication required')) {
        return unauthorizedResponse(error.message);
      }

      if (error.message.includes('Admin access required')) {
        return forbiddenResponse(error.message);
      }

      if (error.message.includes('not found')) {
        return notFoundResponse(error.message);
      }

      if (error.message.includes('Validation failed')) {
        return validationError(null, error.message);
      }

      if (error.message.includes('Duplicate entry')) {
        return errorResponse('Resource already exists', 409);
      }

      // Generic server error
      return errorResponse(
        process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        500
      );
    }
  };
}

// Validate request method
function validateMethod(request, allowedMethods) {
  if (!allowedMethods.includes(request.method)) {
    throw new Error(`Method ${request.method} not allowed`);
  }
}

// Parse request body safely
async function parseRequestBody(request) {
  try {
    const body = await request.json();
    return body;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

// Validate required fields
function validateRequiredFields(data, requiredFields) {
  const errors = {};

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `${field} is required`;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new Error('Validation failed');
  }

  return true;
}

// Sanitize string input
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

// Validate pagination parameters
function validatePagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

// CORS headers for API routes
function setCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS request for CORS
function handleOptions() {
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response);
}

export {
  successResponse,
  errorResponse,
  validationError,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  methodNotAllowedResponse,
  paginatedResponse,
  withErrorHandling,
  validateMethod,
  parseRequestBody,
  validateRequiredFields,
  sanitizeString,
  validatePagination,
  setCorsHeaders,
  handleOptions
};

