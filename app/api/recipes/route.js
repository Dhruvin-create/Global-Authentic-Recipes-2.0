// Recipes API Route
// GET /api/recipes - Get all published recipes with pagination and filters
// POST /api/recipes - Create new recipe (Admin only)

import { 
  successResponse,
  paginatedResponse,
  withErrorHandling,
  validateMethod,
  parseRequestBody,
  validateRequiredFields,
  sanitizeString,
  validatePagination
} from '@/lib/api-response';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

// GET - Get all recipes with filters and pagination
async function getRecipesHandler(request) {
  validateMethod(request, ['GET']);
  
  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = validatePagination(searchParams);
  
  // Filter parameters
  const category = searchParams.get('category');
  const cuisineParam = searchParams.get('cuisine'); // Can be ID or slug
  const difficulty = searchParams.get('difficulty');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured') === 'true';
  
  // Build WHERE clause
  let whereConditions = ['r.is_published = TRUE'];
  let queryParams = [];
  
  if (category) {
    whereConditions.push('r.category = ?');
    queryParams.push(category);
  }
  
  if (cuisineParam) {
    // Check if it's a UUID or slug
    if (cuisineParam.includes('-') && cuisineParam.length > 30) {
      whereConditions.push('r.cuisine_id = ?');
      queryParams.push(cuisineParam);
    } else {
      whereConditions.push('c.slug = ?');
      queryParams.push(cuisineParam);
    }
  }
  
  if (difficulty) {
    whereConditions.push('r.difficulty = ?');
    queryParams.push(difficulty);
  }
  
  if (search) {
    whereConditions.push('(r.title LIKE ? OR r.description LIKE ?)');
    queryParams.push(`%${search}%`, `%${search}%`);
  }
  
  if (featured) {
    whereConditions.push('r.is_featured = TRUE');
  }
  
  const whereClause = whereConditions.join(' AND ');
  
  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM recipes r 
    LEFT JOIN cuisines c ON r.cuisine_id = c.id 
    WHERE ${whereClause}
  `;
  
  const [{ total }] = await executeQuery(countQuery, queryParams);
  
  // Get recipes with pagination
  const recipesQuery = `
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
    WHERE ${whereClause}
    ORDER BY r.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  const recipes = await executeQuery(recipesQuery, queryParams);
  
  return paginatedResponse(recipes, { page, limit, total });
}

// POST - Create new recipe (Admin only)
async function createRecipeHandler(request) {
  validateMethod(request, ['POST']);
  
  // Require admin authentication
  const user = await requireAdmin(request);
  
  // Parse request body
  const body = await parseRequestBody(request);
  
  // Validate required fields
  validateRequiredFields(body, [
    'title', 'description', 'image', 'category', 'cuisineId', 
    'difficulty', 'prepTime', 'cookTime', 'servings', 'ingredients', 'instructions'
  ]);
  
  // Sanitize inputs
  const title = sanitizeString(body.title);
  const description = sanitizeString(body.description);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  // Validate ingredients and instructions arrays
  if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
    return validationError({ ingredients: 'At least one ingredient is required' });
  }
  
  if (!Array.isArray(body.instructions) || body.instructions.length === 0) {
    return validationError({ instructions: 'At least one instruction is required' });
  }
  
  try {
    const recipeId = crypto.randomUUID();
    
    // Insert recipe
    await executeQuery(`
      INSERT INTO recipes (
        id, title, slug, description, image, category, cuisine_id, 
        difficulty, prep_time, cook_time, servings, calories, 
        is_published, is_featured, author_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      recipeId, title, slug, description, body.image, body.category,
      body.cuisineId, body.difficulty, body.prepTime, body.cookTime,
      body.servings, body.calories || null, body.isPublished || false,
      body.isFeatured || false, user.id
    ]);
    
    // Insert ingredients
    for (let i = 0; i < body.ingredients.length; i++) {
      const ingredient = body.ingredients[i];
      await executeQuery(`
        INSERT INTO ingredients (id, recipe_id, name, quantity, display_order)
        VALUES (?, ?, ?, ?, ?)
      `, [crypto.randomUUID(), recipeId, ingredient.name, ingredient.quantity, i + 1]);
    }
    
    // Insert instructions
    for (let i = 0; i < body.instructions.length; i++) {
      const instruction = body.instructions[i];
      await executeQuery(`
        INSERT INTO instructions (id, recipe_id, step_number, description, image)
        VALUES (?, ?, ?, ?, ?)
      `, [crypto.randomUUID(), recipeId, i + 1, instruction.description, instruction.image || null]);
    }
    
    return successResponse({
      recipeId,
      slug
    }, 'Recipe created successfully', 201);
    
  } catch (error) {
    if (error.message.includes('Duplicate entry') && error.message.includes('slug')) {
      return errorResponse('Recipe with this title already exists', 409);
    }
    throw error;
  }
}

// Export handlers
export const GET = withErrorHandling(getRecipesHandler);
export const POST = withErrorHandling(createRecipeHandler);