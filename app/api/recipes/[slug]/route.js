// Individual Recipe API Route
// GET /api/recipes/[slug] - Get single recipe by slug

import { 
  successResponse,
  errorResponse,
  withErrorHandling,
  validateMethod
} from '@/lib/api-response';
import { executeQuery } from '@/lib/database';

async function getRecipeHandler(request, { params }) {
  validateMethod(request, ['GET']);
  
  const { slug } = params;
  
  if (!slug) {
    return errorResponse('Recipe slug is required', 400);
  }
  
  try {
    // Get recipe with all details
    const recipeQuery = `
      SELECT 
        r.id,
        r.title,
        r.slug,
        r.description,
        r.image,
        r.category,
        r.difficulty,
        r.prep_time,
        r.cook_time,
        r.servings,
        r.calories,
        r.is_featured,
        r.view_count,
        r.created_at,
        r.updated_at,
        c.name as cuisine_name,
        c.slug as cuisine_slug,
        u.name as author_name,
        rs.like_count,
        rs.favorite_count,
        rs.review_count,
        rs.avg_rating
      FROM recipes r
      LEFT JOIN cuisines c ON r.cuisine_id = c.id
      LEFT JOIN users u ON r.author_id = u.id
      LEFT JOIN recipe_stats rs ON r.id = rs.id
      WHERE r.slug = ? AND r.is_published = 1
    `;
    
    const recipes = await executeQuery(recipeQuery, [slug]);
    
    if (recipes.length === 0) {
      return errorResponse('Recipe not found', 404);
    }
    
    const recipe = recipes[0];
    
    // Get ingredients
    const ingredientsQuery = `
      SELECT name, quantity, display_order
      FROM ingredients
      WHERE recipe_id = ?
      ORDER BY display_order ASC
    `;
    
    const ingredients = await executeQuery(ingredientsQuery, [recipe.id]);
    
    // Get instructions
    const instructionsQuery = `
      SELECT step_number, description, image
      FROM instructions
      WHERE recipe_id = ?
      ORDER BY step_number ASC
    `;
    
    const instructions = await executeQuery(instructionsQuery, [recipe.id]);
    
    // Increment view count
    try {
      await executeQuery(
        'UPDATE recipes SET view_count = view_count + 1 WHERE id = ?',
        [recipe.id]
      );
    } catch (error) {
      // Don't fail the request if view count update fails
      console.error('Failed to update view count:', error);
    }
    
    // Combine all data
    const recipeData = {
      ...recipe,
      ingredients,
      instructions
    };
    
    return successResponse(recipeData, 'Recipe retrieved successfully');
    
  } catch (error) {
    console.error('Failed to get recipe:', error);
    throw error;
  }
}

export const GET = withErrorHandling(getRecipeHandler);