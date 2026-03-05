import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request, context) {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    context: null,
    params: null,
    slug: null,
    error: null,
    queryResult: null
  };

  try {
    // Log context
    debugInfo.context = context ? 'exists' : 'missing';
    debugInfo.params = context?.params ? 'exists' : 'missing';
    
    // Try to get slug from params
    const params = await context.params;
    debugInfo.slug = params?.slug || 'not found';
    
    if (!params?.slug) {
      return NextResponse.json({
        success: false,
        message: 'Slug not found in params',
        debug: debugInfo
      }, { status: 400 });
    }
    
    // Try simple query
    const result = await executeQuery(
      'SELECT id, title, slug FROM recipes WHERE slug = ? LIMIT 1',
      [params.slug]
    );
    
    debugInfo.queryResult = {
      count: result.length,
      data: result[0] || null
    };
    
    return NextResponse.json({
      success: true,
      message: 'Debug successful',
      debug: debugInfo
    });
    
  } catch (error) {
    debugInfo.error = {
      message: error.message,
      stack: error.stack
    };
    
    return NextResponse.json({
      success: false,
      message: 'Debug failed',
      debug: debugInfo
    }, { status: 500 });
  }
}