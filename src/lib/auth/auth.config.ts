import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/types';

/**
 * Auth configuration that can be used in Edge Runtime (middleware)
 * This file should NOT import any Node.js-only modules like mongoose
 */
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // Protected routes
            const protectedRoutes = ['/admin', '/distributor', '/retailer'];
            const authRoutes = ['/login', '/register'];

            // Skip for API routes and static files
            if (
                pathname.startsWith('/api') ||
                pathname.startsWith('/_next') ||
                pathname.startsWith('/favicon') ||
                pathname.includes('.')
            ) {
                return true;
            }

            // Redirect logged-in users away from auth routes
            if (authRoutes.some((route) => pathname.startsWith(route))) {
                if (isLoggedIn) {
                    const role = auth?.user?.role || 'retailer';
                    return Response.redirect(new URL(`/${role}/dashboard`, nextUrl));
                }
                return true;
            }

            // Check protected routes
            if (protectedRoutes.some((route) => pathname.startsWith(route))) {
                if (!isLoggedIn) {
                    return Response.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
                }

                const userRole = auth?.user?.role;

                // Role-based access
                const roleRoutes: Record<string, string[]> = {
                    admin: ['/admin'],
                    distributor: ['/distributor'],
                    retailer: ['/retailer'],
                };

                const allowedRoutes = roleRoutes[userRole as string] || [];
                const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

                if (!hasAccess) {
                    return Response.redirect(new URL(`/${userRole}/dashboard`, nextUrl));
                }
            }

            // Root redirect
            if (pathname === '/') {
                if (isLoggedIn) {
                    const role = auth?.user?.role || 'retailer';
                    return Response.redirect(new URL(`/${role}/dashboard`, nextUrl));
                }
                return Response.redirect(new URL('/login', nextUrl));
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
            }
            return session;
        },
    },
    providers: [], // Providers are added in auth.ts
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },
};
