import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = 'https://phimapi.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Try to get latest movies as related movies (fallback approach)
    const response = await axios.get(`${API_BASE_URL}/v1/api/danh-sach/phim-moi?page=1&limit=8`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });

    let movies = [];
    
    if (response.data?.status && response.data?.data?.items) {
      movies = response.data.data.items.filter((movie: any) => movie.slug !== slug);
    }

    return NextResponse.json({
      status: true,
      data: {
        movies: movies
      },
      message: 'Related movies fetched successfully'
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=600' // Cache for 10 minutes
      }
    });

  } catch (error) {
    console.error(`Error fetching related movies for ${params.slug}:`, error);
    
    return NextResponse.json(
      { 
        status: false, 
        data: { movies: [] },
        message: 'Failed to fetch related movies',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
