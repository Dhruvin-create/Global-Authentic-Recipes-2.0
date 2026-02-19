// Cuisine Detail API Route
// GET /api/cuisines/[slug] - Get cuisine by slug

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
  
  try {
    const cuisines = await executeQuery(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image,
        cs.recipe_count,
        cs.avg_rating
      FROM cuisines c
      LEFT JOIN cuisine_stats cs ON c.id = cs.id
      WHERE c.slug = ?
    `, [slug]);
    
    if (cuisines.length === 0) {
      return errorResponse('Cuisine not found', 404);
    }
    
    return successResponse(cuisines[0], 'Cuisine retrieved successfully');
  } catch (error) {
    throw error;
  }
}

export const GET = withErrorHandling(getCuisineHandler);
