// Profile Management API Route
// GET /api/auth/profile - Get user profile
// PUT /api/auth/profile - Update user profile

import { 
  successResponse,
  errorResponse,
  validationError,
  withErrorHandling,
  validateMethod,
  parseRequestBody,
  sanitizeString
} from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

// GET - Get user profile
async function getProfileHandler(request) {
  validateMethod(request, ['GET']);
  
  // Require authentication
  const user = await requireAuth(request);
  
  try {
    // Get detailed user profile with statistics
    const profiles = await executeQuery(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.avatar,
        u.role,
        u.is_verified,
        u.created_at,
        u.last_login_at,
        ua.recipes_created,
        ua.reviews_written,
        ua.likes_given,
        ua.favorites_count,
        ua.playlists_count
      FROM users u
      LEFT JOIN user_activity ua ON u.id = ua.id
      WHERE u.id = ?
    `, [user.id]);
    
    if (profiles.length === 0) {
      return errorResponse('User not found', 404);
    }
    
    const profile = profiles[0];
    
    return successResponse({
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar,
        role: profile.role,
        isVerified: profile.is_verified,
        createdAt: profile.created_at,
        lastLoginAt: profile.last_login_at,
        statistics: {
          recipesCreated: profile.recipes_created || 0,
          reviewsWritten: profile.reviews_written || 0,
          likesGiven: profile.likes_given || 0,
          favoritesCount: profile.favorites_count || 0,
          playlistsCount: profile.playlists_count || 0
        }
      }
    }, 'Profile retrieved successfully');
    
  } catch (error) {
    throw error;
  }
}

// PUT - Update user profile
async function updateProfileHandler(request) {
  validateMethod(request, ['PUT']);
  
  // Require authentication
  const user = await requireAuth(request);
  
  // Parse request body
  const body = await parseRequestBody(request);
  
  // Sanitize inputs
  const name = body.name ? sanitizeString(body.name) : null;
  const avatar = body.avatar ? sanitizeString(body.avatar) : null;
  
  // Validate name if provided
  if (name && (name.length < 2 || name.length > 50)) {
    return validationError({
      name: 'Name must be between 2 and 50 characters'
    });
  }
  
  // Validate avatar URL if provided
  if (avatar && !avatar.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
    return validationError({
      avatar: 'Avatar must be a valid image URL'
    });
  }
  
  try {
    // Build update query dynamically
    const updates = [];
    const params = [];
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    
    if (avatar !== undefined) { // Allow null to remove avatar
      updates.push('avatar = ?');
      params.push(avatar);
    }
    
    if (updates.length === 0) {
      return validationError({
        general: 'No valid fields provided for update'
      });
    }
    
    // Add updated_at
    updates.push('updated_at = NOW()');
    params.push(user.id);
    
    // Execute update
    await executeQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    // Get updated profile
    const updatedUsers = await executeQuery(
      'SELECT id, name, email, phone, avatar, role, is_verified FROM users WHERE id = ?',
      [user.id]
    );
    
    return successResponse({
      user: updatedUsers[0]
    }, 'Profile updated successfully');
    
  } catch (error) {
    throw error;
  }
}

// Export handlers
export const GET = withErrorHandling(getProfileHandler);
export const PUT = withErrorHandling(updateProfileHandler);