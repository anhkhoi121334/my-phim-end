import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Sử dụng await để lấy params từ context theo yêu cầu của Next.js
    const { id } = await context.params;
    console.log(`Đã nhận lượt xem cho phim ID: ${id}`);
    
    // Đơn giản trả về thành công mà không thực hiện bất kỳ thao tác lưu trữ nào
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi' },
      { status: 500 }
    );
  }
}

