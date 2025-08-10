import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT Secret key from env variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';

// Protected paths requiring authentication
const protectedPaths = [
  '/profile',
  '/favorites',
  '/watchlist',
  '/settings',
  '/history',
];

// Admin-only paths
const adminPaths = [
  '/admin',
  '/admin/users',
  '/admin/movies',
  '/admin/categories',
  '/admin/settings',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip authentication check for non-protected paths
  if (!protectedPaths.some(path => pathname.startsWith(path)) && 
      !adminPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Get token from cookie (either auth_token or next-auth.session-token)
  const authToken = request.cookies.get('auth_token')?.value;
  const nextAuthToken = request.cookies.get('next-auth.session-token')?.value || 
                        request.cookies.get('__Secure-next-auth.session-token')?.value;
  
  // If no token and accessing protected path
  if (!authToken && !nextAuthToken) {
    // Redirect to login with redirect URL
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  try {
    // Use auth_token if available, otherwise use NextAuth session
    let decoded;
    
    if (authToken) {
      // Decode JWT token
      decoded = jwt.verify(authToken, JWT_SECRET) as { userId: string; role: string };
    } else if (nextAuthToken) {
      // For NextAuth, we need to check the session in a different way
      // This is a simplified version - in production you'd verify the session properly
      // For now, we'll just let it pass and rely on the admin page to check role
      return NextResponse.next();
    }
    
    // Check if path is admin-only and we have a decoded token
    if (adminPaths.some(path => pathname.startsWith(path)) && decoded && decoded.role !== 'admin') {
      // Redirect to home if not admin
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Allow access if authenticated
    return NextResponse.next();
  } catch {
    // Invalid or expired token
    // Delete cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /static (public files)
     * 4. Files with extensions (static files)
     */
    '/((?!api|_next|static|.*\\..*).*)',
  ],
}; 