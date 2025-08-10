import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');

    console.log('Search params:', { page, limit, search, role });

    // Kết nối MongoDB
    await connectToDatabase();

    // Tạo điều kiện tìm kiếm
    const filter: Record<string, unknown> = {};
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (role && role !== 'all') {
      filter.role = role.toLowerCase();
    }

    console.log('Query conditions:', JSON.stringify(filter, null, 2));

    // Đếm tổng số bản ghi
    const total = await User.countDocuments(filter);
    console.log('Total records:', total);

    // Lấy danh sách người dùng
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    console.log(`Found ${users.length} users`);

    // Chuyển đổi _id thành id và format lại dữ liệu
    const formattedUsers = users.map((user) => ({
      id: (user._id as { toString(): string }).toString(),
      name: user.fullName || user.name,
      email: user.email,
      image: user.image || '/default-avatar.png',
      role: (user.role || 'user').toLowerCase(),
      createdAt: user.createdAt || user.updatedAt || new Date(),
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });

    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 