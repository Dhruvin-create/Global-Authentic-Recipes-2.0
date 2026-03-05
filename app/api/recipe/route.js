import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        message: 'Recipe slug is required'
      }, { status: 400 });
    }
    
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
      return NextResponse.json({
        success: false,
        message: 'Recipe not found'
      }, { status: 404 });
    }
    
    const recipe = recipes[0];
    
    // Get ingredients
    const ingredients = await executeQuery(
      'SELECT name, quantity, display_order FROM ingredients WHERE recipe_id = ? ORDER BY display_order ASC',
      [recipe.id]
    );
    
    // Get instructions
    const instructions = await executeQuery(
      'SELECT step_number, description, image FROM instructions WHERE recipe_id = ? ORDER BY step_number ASC',
      [recipe.id]
    );
    
    // Increment view count
    try {
      await executeQuery(
        'UPDATE recipes SET view_count = view_count + 1 WHERE id = ?',
        [recipe.id]
      );
    } catch (error) {
      console.error('Failed to update view count:', error);
    }
    
    // Combine all data
    const recipeData = {
      ...recipe,
      ingredients,
      instructions
    };
    
    return NextResponse.json({
      success: true,
      message: 'Recipe retrieved successfully',
      data: recipeData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Recipe API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}