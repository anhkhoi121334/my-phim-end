import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Khóa bí mật để ký JWT
const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

// Interface cho dữ liệu người dùng đã giải mã từ token
export interface DecodedUser {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Lấy thông tin người dùng từ token trong cookie
 */
export function getCurrentUser(): DecodedUser | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    // Giải mã token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    return decoded;
  } catch {
    console.error('Error getting current user');
    return null;
  }
}

/**
 * Middleware để kiểm tra xác thực
 */
export function withAuth(handler: (req: NextRequest, user: DecodedUser) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Lấy token từ cookie
      const token = req.cookies.get('auth_token')?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy token xác thực' },
          { status: 401 }
        );
      }

      // Giải mã token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
      } catch {
        return NextResponse.json(
          { success: false, message: 'Token không hợp lệ hoặc đã hết hạn' },
          { status: 401 }
        );
      }

      // Gọi handler với thông tin người dùng đã giải mã
      return handler(req, decoded);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, message: 'Đã xảy ra lỗi khi xác thực' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware để kiểm tra quyền admin
 */
export function withAdmin(handler: (req: NextRequest, user: DecodedUser) => Promise<NextResponse>) {
  return withAuth(async (req, user) => {
    // Kiểm tra nếu người dùng không phải admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Không có quyền truy cập' },
        { status: 403 }
      );
    }

    // Gọi handler với thông tin người dùng đã giải mã
    return handler(req, user);
  });
} 