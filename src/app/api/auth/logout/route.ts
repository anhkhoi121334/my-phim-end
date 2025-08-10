import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear auth token cookie
    const cookieStore = cookies();
    cookieStore.delete('auth_token');

    return NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi đăng xuất' },
      { status: 500 }
    );
  }
} 