import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';

// 获取用户信息
export async function GET() {
  try {
    // 尝试从NextAuth会话获取用户
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      // 连接到数据库
      await connectToDatabase();
      
      // 查询用户信息
      const user = await User.findById(session.user.id);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy thông tin người dùng' },
          { status: 404 }
        );
      }
      
      // 返回用户信息
      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          image: user.image,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    }
    
    // 如果没有NextAuth会话，尝试从JWT令牌获取用户
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }
    
    try {
      // 验证JWT令牌
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // 连接到数据库
      await connectToDatabase();
      
      // 查询用户信息
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy thông tin người dùng' },
          { status: 404 }
        );
      }
      
      // 返回用户信息
      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          image: user.image,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch {
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi lấy thông tin người dùng' },
      { status: 500 }
    );
  }
}

// 更新用户信息
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { fullName, image, imageUrl } = data as { fullName?: string; image?: string; imageUrl?: string };

    const avatarUrl = (imageUrl || image || '').toString().trim();
    const hasNameUpdate = typeof fullName === 'string';
    const hasAvatarUpdate = avatarUrl.length > 0;

    if (!hasNameUpdate && !hasAvatarUpdate) {
      return NextResponse.json({ success: false, message: 'Không có dữ liệu để cập nhật' }, { status: 400 });
    }

    // 尝试从NextAuth会话获取用户
    const session = await getServerSession(authOptions);
    let userId: string | undefined;

    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // 如果没有NextAuth会话，尝试从JWT令牌获取用户
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Chưa đăng nhập' },
          { status: 401 }
        );
      }

      try {
        // 验证JWT令牌
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch {
        return NextResponse.json(
          { success: false, message: 'Token không hợp lệ' },
          { status: 401 }
        );
      }
    }

    // 连接到数据库
    await connectToDatabase();

    const updateDoc: Record<string, string> = {};
    if (hasNameUpdate) {
      if (!fullName || !fullName.trim()) {
        return NextResponse.json(
          { success: false, message: 'Họ tên không được để trống' },
          { status: 400 }
        );
      }
      updateDoc.fullName = fullName.trim();
    }
    if (hasAvatarUpdate) {
      try {
        const url = new URL(avatarUrl);
        if (!/^https?:$/.test(url.protocol)) {
          throw new Error('invalid');
        }
      } catch {
        return NextResponse.json(
          { success: false, message: 'Link ảnh không hợp lệ' },
          { status: 400 }
        );
      }
      updateDoc.image = avatarUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateDoc, { new: true });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: {
        id: updatedUser._id.toString(),
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        image: updatedUser.image,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi cập nhật thông tin' },
      { status: 500 }
    );
  }
}

// 上传并更新头像
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ success: false, message: 'Thiếu tệp ảnh' }, { status: 400 });
    }

    // Validate type and size
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Định dạng ảnh không hợp lệ' }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'Ảnh vượt quá 2MB' }, { status: 400 });
    }

    // Save file to public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadsDir = `${process.cwd()}/public/uploads`;
    const fs = await import('fs');
    const path = await import('path');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = file.name.split('.').pop() || 'png';
    const filename = `avatar-${session.user.id}-${Date.now()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);

    const publicUrl = `/uploads/${filename}`;

    // Update user image
    await connectToDatabase();
    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { image: publicUrl },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Lỗi cập nhật avatar:', error);
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ' }, { status: 500 });
  }
}