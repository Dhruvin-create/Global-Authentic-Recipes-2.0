import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        message: 'Cuisine slug is required'
      }, { status: 400 });
    }
    
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
      return NextResponse.json({
        success: false,
        message: 'Cuisine not found'
      }, { status: 404 });
    }
    
    const cuisine = cuisines[0];
    
    return NextResponse.json({
      success: true,
      message: 'Cuisine retrieved successfully',
      data: cuisine,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Cuisine API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}