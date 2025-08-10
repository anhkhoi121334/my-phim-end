import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

// JWT Secret key from env variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp email và mật khẩu' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // Compare password hash with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookieStore = cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        image: user.image
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi đăng nhập' },
      { status: 500 }
    );
  }
} 