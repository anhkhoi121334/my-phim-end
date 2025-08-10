import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Default settings
const defaultSettings = {
  site: {
    name: 'MyPhim',
    description: 'Website xem phim trực tuyến hàng đầu Việt Nam',
    logo: '/myphim-logo.svg',
    favicon: '/favicon.ico',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh'
  },
  api: {
    phimapiUrl: 'https://phimapi.com',
    tmdbApiKey: '',
    enableCaching: true,
    cacheDuration: 3600
  },
  security: {
    enableRegistration: true,
    requireEmailVerification: false,
    maxLoginAttempts: 5,
    sessionTimeout: 24
  },
  notifications: {
    enableEmailNotifications: false,
    enablePushNotifications: true,
    adminEmail: 'admin@myphim.com'
  },
  appearance: {
    theme: 'light',
    primaryColor: '#3b82f6',
    enableAnimations: true
  }
};

// GET settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return default settings
    // In production, you would fetch from database
    return NextResponse.json({ 
      success: true, 
      settings: defaultSettings 
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST/PUT settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await req.json();

    // Validate settings structure
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    // In production, save to database here
    // For now, just return success
    console.log('Settings saved:', settings);

    return NextResponse.json({ 
      success: true, 
      message: 'Settings saved successfully',
      settings 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 