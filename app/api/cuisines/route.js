// Cuisines API Route
// GET /api/cuisines - Get all cuisines

import { 
  successResponse,
  withErrorHandling,
  validateMethod
} from '@/lib/api-response';
import { executeQuery } from '@/lib/database';

async function getCuisinesHandler(request) {
  validateMethod(request, ['GET']);
  
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
      ORDER BY c.name ASC
    `);
    
    return successResponse(cuisines, 'Cuisines retrieved successfully');
  } catch (error) {
    throw error;
  }
}

export const GET = withErrorHandling(getCuisinesHandler);
