import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Interface cho movie history
interface WatchedMovie {
  _id: string;
  slug: string;
  name: string;
  thumb_url: string;
  time: number; // Thời gian xem
}

export async function GET() {
  try {
    // Thêm await trước cookies()
    const cookieStore = await cookies();
    const history = cookieStore.get('watched_movies');
    
    const watchedMovies: WatchedMovie[] = history ? 
      JSON.parse(history.value) : [];

    return NextResponse.json({
      status: true,
      history: watchedMovies,
      message: 'Watch history fetched successfully'
    });

  } catch (error) {
    return NextResponse.json({
      status: false,
      history: [],
      message: 'Failed to fetch watch history'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const movie = await request.json();
    // Thêm await trước cookies()
    const cookieStore = await cookies();
    let history: WatchedMovie[] = [];
    
    // Lấy history hiện tại
    const existingHistory = cookieStore.get('watched_movies');
    if (existingHistory) {
      history = JSON.parse(existingHistory.value);
    }

    // Xóa nếu phim đã tồn tại
    history = history.filter(m => m._id !== movie._id);
    
    // Thêm vào đầu mảng
    history.unshift({
      ...movie,
      time: Date.now()
    });

    // Giới hạn 20 phim
    history = history.slice(0, 20);

    // Lưu vào cookie
    const response = NextResponse.json({
      status: true,
      message: 'Movie added to history'
    });

    response.cookies.set('watched_movies', JSON.stringify(history), {
      maxAge: 30 * 24 * 60 * 60, // 30 ngày
      path: '/'
    });

    return response;

  } catch (error) {
    return NextResponse.json({
      status: false,
      message: 'Failed to save watch history'
    }, { status: 500 });
  }
}