import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        message: 'Recipe slug is required'
      }, { status: 400 });
    }
    
    // Simple query without joins
    const recipes = await executeQuery(
      'SELECT * FROM recipes WHERE slug = ? AND is_published = 1 LIMIT 1',
      [slug]
    );
    
    if (recipes.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Recipe not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Recipe found',
      data: recipes[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error: ' + error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}