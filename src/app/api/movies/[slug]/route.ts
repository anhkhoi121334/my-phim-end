import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = 'https://phimapi.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Try different API endpoints for movie details
    let response;
    const endpoints = [
      `/phim/${slug}`,
      `/v1/api/phim/${slug}`,
      `/api/phim/${slug}`,
      `/movie/${slug}`
    ];
    
    let lastError;
    for (const endpoint of endpoints) {
      try {
        response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          timeout: 10000 // 10 second timeout
        });
        
        // If we get here, the request was successful
        if (response.data) {
          console.log(`Successfully fetched movie details using endpoint: ${endpoint}`);
          break;
        }
      } catch (error: any) {
        console.log(`Failed to fetch from endpoint ${endpoint}:`, error?.response?.status);
        lastError = error;
        continue;
      }
    }
    
    // If no endpoint worked, throw the last error
    if (!response) {
      throw lastError || new Error('All API endpoints failed');
    }

    // Return the data with CORS headers
    return NextResponse.json(response.data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });

  } catch (error: any) {
    const endpoints = [
      `/phim/${params.slug}`,
      `/v1/api/phim/${params.slug}`,
      `/api/phim/${params.slug}`,
      `/movie/${params.slug}`
    ];
    
    console.error(`Error fetching movie details for ${params.slug}:`, {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      triedEndpoints: endpoints.map(ep => `${API_BASE_URL}${ep}`)
    });
    
    // Return error response
    return NextResponse.json(
      { 
        status: false, 
        message: 'Failed to fetch movie details from all endpoints',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          triedEndpoints: endpoints.map(ep => `${API_BASE_URL}${ep}`)
        }
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

// Handle preflight requests
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
