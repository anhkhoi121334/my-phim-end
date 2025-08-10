import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';

export async function GET() {
  try {
    // 首先尝试从NextAuth会话获取用户
    const session = await getServerSession(authOptions);
    console.log('当前会话信息:', session);
    
    if (session?.user) {
      console.log('从会话中获取到用户信息:', {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      });
      
      // 验证数据库中的用户信息
      await connectToDatabase();
      const dbUser = await User.findById(session.user.id);
      
      if (!dbUser) {
        console.error('会话用户在数据库中不存在:', session.user.id);
        return NextResponse.json(
          { success: false, message: '用户不存在' },
          { status: 404 }
        );
      }
      
      // 确保返回数据库中的最新角色
      return NextResponse.json({
        success: true,
        user: {
          id: dbUser._id.toString(),
          fullName: dbUser.fullName,
          email: dbUser.email,
          role: dbUser.role,
          image: dbUser.image
        }
      });
    }
    
    // 如果没有NextAuth会话，尝试从JWT令牌获取用户
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      console.log('未找到认证令牌');
      return NextResponse.json(
        { success: false, message: '未授权' },
        { status: 401 }
      );
    }
    
    try {
      // 验证JWT令牌
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
      console.log('JWT令牌解析结果:', decoded);
      
      // 连接到MongoDB并获取用户信息
      await connectToDatabase();
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        console.error('JWT中的用户在数据库中不存在:', decoded.userId);
        return NextResponse.json(
          { success: false, message: '用户不存在' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          image: user.image
        }
      });
    } catch (error) {
      console.error('JWT验证失败:', error);
      return NextResponse.json(
        { success: false, message: '无效的令牌' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { success: false, message: '获取用户信息时出错' },
      { status: 500 }
    );
  }
} 