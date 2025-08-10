import { NextResponse } from 'next/server';
import { movieApi } from '@/services';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const category = searchParams.get('category') || undefined;
    const country = searchParams.get('country') || undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const sortBy = searchParams.get('sortBy') || 'latest';

    // Lấy danh sách phim từ API
    const response = await movieApi.getLatestMovies(
      page,
      limit,
      sortBy,
      category,
      country,
      year
    );

    return NextResponse.json({
      success: true,
      data: {
        items: response.items,
        pagination: response.pagination
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phim:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy danh sách phim' },
      { status: 500 }
    );
  }
} 