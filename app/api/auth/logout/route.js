// Logout API Route
// POST /api/auth/logout
// Logout user (client-side token removal, server-side can blacklist if needed)

import { 
  successResponse,
  withErrorHandling,
  validateMethod
} from '@/lib/api-response';

async function logoutHandler(request) {
  // Validate HTTP method
  validateMethod(request, ['POST']);
  
  // For JWT tokens, logout is typically handled client-side by removing the token
  // Server-side logout would require token blacklisting (optional feature)
  
  return successResponse(
    null,
    'Logged out successfully. Please remove the token from client storage.'
  );
}

// Export with error handling
export const POST = withErrorHandling(logoutHandler);