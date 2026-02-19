// Get Current User API Route
// GET /api/auth/me
// Get current authenticated user information

import { 
  successResponse,
  withErrorHandling,
  validateMethod
} from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

async function getCurrentUserHandler(request) {
  // Validate HTTP method
  validateMethod(request, ['GET']);
  
  // Require authentication
  const user = await requireAuth(request);
  
  return successResponse({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.is_verified,
      createdAt: user.created_at
    }
  }, 'User information retrieved successfully');
}

// Export with error handling
export const GET = withErrorHandling(getCurrentUserHandler);