import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    
    return NextResponse.json({
      success: true,
      message: 'Debug recipe API working',
      slug: slug,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error in debug recipe API',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}