import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    
    // Test basic query first
    const testResult = await executeQuery('SELECT 1 as test');
    
    // Test recipe query without boolean check
    const recipes = await executeQuery(
      'SELECT id, title, slug FROM recipes WHERE slug = ? LIMIT 1',
      [slug]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Test successful',
      slug: slug,
      testQuery: testResult,
      recipeCount: recipes.length,
      recipe: recipes[0] || null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error: ' + error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}