import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authConfig } from '@/lib/auth/auth.config';

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/pending-approval', '/api/auth'];

// Routes accessible by specific roles
const roleRoutes: Record<string, string[]> = {
    admin: ['/admin'],
    distributor: ['/distributor', '/complete-profile'],
    retailer: ['/retailer', '/complete-profile'],
};

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
        return NextResponse.next();
    }

    // Allow ALL API routes - auth is handled by individual routes
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Allow static files
    if (pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next();
    }


    // Get the token/session
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    // Redirect to login if not authenticated
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as string;
    const userStatus = (token as any).status as string || 'active';

    // Handle users based on their status
    if (userRole !== 'admin') {
        // Pending approval - redirect to pending page
        if (userStatus === 'pending_approval') {
            if (pathname !== '/pending-approval') {
                return NextResponse.redirect(new URL('/pending-approval', request.url));
            }
            return NextResponse.next();
        }

        // Pending documents - redirect to complete profile
        if (userStatus === 'pending_documents') {
            if (pathname !== '/complete-profile') {
                return NextResponse.redirect(new URL('/complete-profile', request.url));
            }
            return NextResponse.next();
        }

        // Pending verification - allow limited access
        if (userStatus === 'pending_verification') {
            // Allow access to their dashboard but with limited functionality
            const allowedRoutes = [`/${userRole}`, '/complete-profile'];
            const isAllowed = allowedRoutes.some(
                (route) => pathname === route || pathname.startsWith(`${route}/`)
            );
            if (!isAllowed) {
                return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
            }
            return NextResponse.next();
        }

        // Rejected - redirect to pending approval page with message
        if (userStatus === 'rejected') {
            if (pathname !== '/pending-approval') {
                return NextResponse.redirect(new URL('/pending-approval?rejected=true', request.url));
            }
            return NextResponse.next();
        }
    }

    // Check role-based access for active users
    const allowedRoutes = roleRoutes[userRole] || [];
    const isAllowed = allowedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (!isAllowed) {
        // Redirect to appropriate dashboard
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
