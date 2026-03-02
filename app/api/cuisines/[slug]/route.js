// Individual Cuisine API Route
// GET /api/cuisines/[slug] - Get single cuisine by slug

import { 
  successResponse,
  errorResponse,
  withErrorHandling,
  validateMethod
} from '@/lib/api-response';
import { executeQuery } from '@/lib/database';

async function getCuisineHandler(request, { params }) {
  validateMethod(request, ['GET']);
  
  const { slug } = params;
  
  if (!slug) {
    return errorResponse('Cuisine slug is required', 400);
  }
  
  try {
    // Get cuisine with stats
    const cuisineQuery = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image,
        c.created_at,
        cs.recipe_count,
        cs.avg_rating
      FROM cuisines c
      LEFT JOIN cuisine_stats cs ON c.id = cs.id
      WHERE c.slug = ?
    `;
    
    const cuisines = await executeQuery(cuisineQuery, [slug]);
    
    if (cuisines.length === 0) {
      return errorResponse('Cuisine not found', 404);
    }
    
    const cuisine = cuisines[0];
    
    return successResponse(cuisine, 'Cuisine retrieved successfully');
    
  } catch (error) {
    console.error('Failed to get cuisine:', error);
    throw error;
  }
}

export const GET = withErrorHandling(getCuisineHandler);