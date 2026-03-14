import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Bypass public routes (login and static Next.js assets)
  if (
    pathname === '/login' ||
    pathname === '/api/login' || // Fixed missing leading slash
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  // 2. Extract token from the Authorization header OR the Cookies
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.split(' ')[1];
  const cookieToken = request.cookies.get('auth_token')?.value;

  // Use bearer token if it exists (API calls), otherwise fallback to cookie (Page navigations)
  const token = bearerToken || cookieToken;

  if (!token) {
    // If it's an API request, return 401. If it's a page request, redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // 3. Validate token (runs seamlessly on Edge Runtime)
    const claims = await verifyToken(token);

    // 4. RBAC (Role-Based Access Control) Enforcement
    // Example: /admin routes strictly require the 'platform-admin' role
    if (pathname.startsWith('/admin') && !claims.roles.includes('platform-admin')) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permission' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // 5. Inject decoded claims into the request headers for downstream API Routes to consume
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-claims', JSON.stringify(claims));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    // Handle invalid, malformed, or expired tokens
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static files, images and favicon
    '/((?!_next/static|_next/image|favicon.ico|login|api/login).*)',
  ],
};
