import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';

// Dữ liệu mẫu
const sampleUsers = [
  {
    fullName: 'Admin User',
    email: 'admin@example.com',
    passwordHash: '', // Will be set below
    role: 'admin',
    provider: 'credentials',
    image: '/default-avatar.png'
  },
  {
    fullName: 'Regular User',
    email: 'user@example.com',
    passwordHash: '', // Will be set below
    role: 'user',
    provider: 'credentials',
    image: '/default-avatar.png'
  },
  {
    fullName: 'Test User',
    email: 'test@example.com',
    passwordHash: '', // Will be set below
    role: 'user',
    provider: 'credentials',
    image: '/default-avatar.png'
  }
];

export async function GET() {
  try {
    // Kết nối MongoDB
    await connectToDatabase();
    
    // Hash passwords for sample users
    const defaultPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    
    // Update sample users with hashed password
    const usersWithHashedPasswords = sampleUsers.map(user => ({
      ...user,
      passwordHash: hashedPassword
    }));
    
    // Xóa dữ liệu cũ (nếu cần)
    // await User.deleteMany({});
    
    // Thêm dữ liệu mẫu
    const result = await User.insertMany(usersWithHashedPasswords);
    
    return NextResponse.json({
      success: true,
      message: `Đã thêm ${result.length} người dùng mẫu`,
      note: 'Default password for all users: password123',
      users: result.map(user => ({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }))
    });
  } catch (error) {
    console.error('Error seeding users:', error);
    return NextResponse.json(
      { error: 'Failed to seed users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 