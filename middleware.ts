import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register' || path === '/' || path === '/about' || path === '/faqs';

  // Get the session token
  const token = await getToken({ req: request });

  // Redirect logic
  if (isPublicPath && token) {
    // If user is logged in and tries to access public path, redirect based on role
    const userRole = token.role as string;
    if (userRole === 'TECHNICIAN') {
      return NextResponse.redirect(new URL('/technician', request.url));
    } else if (userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/user/search', request.url));
    }
  }

  if (!isPublicPath && !token) {
    // If user is not logged in and tries to access protected path, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  if (token) {
    const userRole = token.role as string;

    // Protect technician routes
    if (path.startsWith('/technician') && userRole !== 'TECHNICIAN') {
      return NextResponse.redirect(new URL('/user', request.url));
    }

    // Protect admin routes
    if (path.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/user', request.url));
    }

    // Protect user routes
    if (path.startsWith('/user') && userRole === 'TECHNICIAN') {
      return NextResponse.redirect(new URL('/technician', request.url));
    }
    if (path.startsWith('/user') && userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 