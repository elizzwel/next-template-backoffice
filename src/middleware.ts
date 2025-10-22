import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

let menuCache: MenuItem[] | null = null;
let menuCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

// Define allowed routes (whitelist)
const ALLOWED_ROUTES: string[] = [
  '/dashboard',
  '/forbidden',
  // Dynamic routes will be checked from database
];

type MenuItem = { path: string; permission_code: string | null; is_active: boolean };

async function getMenuItems(): Promise<MenuItem[]> {
  const now = Date.now();

  if (menuCache && (now - menuCacheTime) < CACHE_DURATION) {
    return menuCache;
  }

  try {
    if (!supabaseUrl || !supabaseKey) {
      return [];
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('menu_items')
      .select('path, permission_code, is_active')
      .eq('is_active', true);

    menuCache = (data as MenuItem[]) || [];
    menuCacheTime = now;
    return menuCache;
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    return [];
  }
}

async function isRouteAllowed(pathname: string): Promise<{ allowed: boolean; permission: string | null }> {
  // Check static allowed routes
  if (ALLOWED_ROUTES.includes(pathname)) {
    return { allowed: true, permission: null };
  }

  // Check menu items from database
  const menuItems = await getMenuItems();

  // Exact match
  const exactMatch = menuItems.find(item => item.path === pathname);
  if (exactMatch) {
    return {
      allowed: true,
      permission: exactMatch.permission_code,
    };
  }

  // Dynamic route match (starts with)
  const dynamicMatch = menuItems.find(item =>
    pathname.startsWith(item.path + '/') && item.path !== '/'
  );
  if (dynamicMatch) {
    return {
      allowed: true,
      permission: dynamicMatch.permission_code,
    };
  }

  // Route not found in menu
  return { allowed: false, permission: null };
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public paths
  const publicPaths = ['/login', '/forbidden'];
  // Only '/' should be exact match; others can be prefix matches
  const isPublicPath = pathname === '/' || publicPaths.some(path => pathname.startsWith(path));

  // API routes
  if (pathname.startsWith('/api')) {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret);

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', String((payload as any).userId));
        requestHeaders.set('x-user-role', String((payload as any).role));
        requestHeaders.set('x-user-permissions', JSON.stringify((payload as any).permissions || []));

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } catch (error) {
        console.error('❌ Token verification failed:', error);
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    return NextResponse.next();
  }

  // Redirect to login if no token
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if logged in and accessing login
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected routes - Check if route exists and has permission
  if (token && !isPublicPath) {
    try {
      const { payload } = await jwtVerify(token, secret);

      // Check if route is allowed
      const { allowed, permission: requiredPermission } = await isRouteAllowed(pathname);

      if (!allowed) {
        console.log(`🚫 Route not found: ${pathname}`);
        return NextResponse.redirect(new URL('/forbidden?error=route-not-found', request.url));
      }

      // Check permission if required
      if (requiredPermission) {
        const userPermissions: string[] = (payload as any).permissions || [];
        const hasPermission = userPermissions.includes(requiredPermission);

        if (!hasPermission) {
          console.log(`❌ Access denied to ${pathname} - requires ${requiredPermission}`);
          const forbiddenUrl = new URL('/forbidden', request.url);
          forbiddenUrl.searchParams.set('route', pathname);
          forbiddenUrl.searchParams.set('permission', requiredPermission);
          return NextResponse.redirect(forbiddenUrl);
        }

        console.log(`✅ Access granted to ${pathname}`);
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', String((payload as any).userId));
      requestHeaders.set('x-user-role', String((payload as any).role));
      requestHeaders.set('x-user-permissions', JSON.stringify((payload as any).permissions || []));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};




