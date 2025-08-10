import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = 'https://phimapi.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // First get movie details to get the episodes
    const response = await axios.get(`${API_BASE_URL}/phim/${slug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });

    // Extract episodes from the response
    const movieData = response.data;
    let episodes = [];

    if (movieData?.status && movieData?.episodes) {
      // Handle different episode data structures
      if (Array.isArray(movieData.episodes)) {
        episodes = movieData.episodes.flatMap((episodeGroup: any) => 
          episodeGroup.server_data || []
        );
      } else if (movieData.episodes[0]?.server_data) {
        episodes = movieData.episodes[0].server_data;
      }
    }

    return NextResponse.json({
      status: true,
      episodes: episodes,
      message: 'Episodes fetched successfully'
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error(`Error fetching episodes for ${params.slug}:`, error);
    
    return NextResponse.json(
      { 
        status: false, 
        episodes: [],
        message: 'Failed to fetch episodes',
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

