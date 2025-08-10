import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get all query parameters
    const queryParams = new URLSearchParams({
      page: searchParams.get('page') || '1',
      sort_field: searchParams.get('sort_field') || 'modified.time',
      sort_type: searchParams.get('sort_type') || 'desc',
      limit: searchParams.get('limit') || '24'
    });

    // Add optional parameters if they exist
    const sort_lang = searchParams.get('sort_lang');
    if (sort_lang) queryParams.append('sort_lang', sort_lang);

    const country = searchParams.get('country');
    if (country) queryParams.append('country', country);

    const year = searchParams.get('year');
    if (year) queryParams.append('year', year);

    // Fetch movies from phimapi.com
    const response = await fetch(
      `https://phimapi.com/v1/api/the-loai/${params.slug}?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch movies from phimapi.com');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching category movies:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch movies'
      },
      { status: 500 }
    );
  }
} 