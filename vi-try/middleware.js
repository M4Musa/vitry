import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// More robust middleware for production
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Only log in development to avoid production log spam
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Protecting route: ${pathname}`);
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        try {
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Auth Check] Path: ${pathname}, Has token: ${!!token}`);
          }
          
          // Allow access if user has a valid token
          return !!token;
        } catch (error) {
          // Log error but don't crash
          console.error('[Middleware Error]:', error);
          return false; // Deny access on error
        }
      },
    },
    // Specify the pages configuration to match NextAuth config
    pages: {
      signIn: '/login',
      error: '/login',
    },
  }
);

export const config = {
  matcher: [
    // Protected routes that require authentication
    "/clora/:path*",     // Virtual try-on functionality
    "/profile/:path*",   // User profile pages
    "/settings/:path*",  // User settings
    "/try-on/:path*",    // Try-on related pages
    "/subscription/:path*" // Subscription pages
    // Note: We don't use negative lookahead matcher as it can cause issues in production
    // Instead, we explicitly list routes that need protection
  ],
};
