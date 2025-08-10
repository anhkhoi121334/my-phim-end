import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('Attempting to delete user:', id);
    
    // Kết nối MongoDB
    await connectToDatabase();
    
    // Xóa người dùng
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Successfully deleted user:', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });

    return NextResponse.json(
      { error: 'Failed to delete user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 