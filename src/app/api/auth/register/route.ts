import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';

export async function POST(req: Request) {
  try {
    const { fullName, email, password } = await req.json();
    console.log('开始处理注册请求:', { fullName, email });

    // Validate input
    if (!fullName || !email || !password) {
      console.log('输入验证失败: 缺少必要字段');
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập đầy đủ thông tin' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('输入验证失败: 邮箱格式无效', email);
      return NextResponse.json(
        { success: false, message: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Password validation (min 6 chars)
    if (password.length < 6) {
      console.log('输入验证失败: 密码长度不足');
      return NextResponse.json(
        { success: false, message: 'Mật khẩu phải có ít nhất 6 kí tự' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    console.log('尝试连接数据库...');
    try {
      await connectToDatabase();
      console.log('数据库连接成功');
    } catch (dbError) {
      console.error('数据库连接失败:', dbError);
      return NextResponse.json(
        { success: false, message: 'Không thể kết nối đến cơ sở dữ liệu' },
        { status: 500 }
      );
    }

    // Check if email already exists
    console.log('检查邮箱是否已存在:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('邮箱已被使用:', email);
      return NextResponse.json(
        { success: false, message: 'Email đã được sử dụng' },
        { status: 400 }
      );
    }

    // Hash password
    console.log('开始加密密码...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log('密码加密完成');

    // Create new user
    console.log('创建新用户...');
    const newUser = await User.create({
      fullName,
      email,
      passwordHash,
      provider: 'credentials',
      role: 'user'
    });
    console.log('新用户创建成功:', newUser._id);

    // Generate JWT token
    console.log('生成 JWT 令牌...');
    const token = jwt.sign(
      { userId: newUser._id.toString(), email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser._id.toString(),
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      },
    });

    // Set cookie in the response
    console.log('设置认证 cookie...');
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    console.log('注册流程完成');
    return response;
  } catch (error: unknown) {
    console.error('注册过程中发生错误:', error);
    // 提供更具体的错误信息
    let errorMessage = 'Đã xảy ra lỗi khi đăng ký';
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      errorMessage = 'Email đã được sử dụng';
    } else if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError' && 'errors' in error) {
      const validationError = error as { errors: Record<string, { message: string }> };
      errorMessage = Object.values(validationError.errors).map((err) => err.message).join(', ');
    } else if (error && typeof error === 'object' && 'name' in error && error.name === 'MongoServerError') {
      errorMessage = 'Lỗi kết nối cơ sở dữ liệu';
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
} 