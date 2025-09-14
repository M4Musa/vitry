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
        
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Auth Check] Path: ${pathname}, Has token: ${!!token}`);
        }
        
        // Allow access if user has a valid token
        return !!token;
      },
    },
    // Specify the pages configuration to match NextAuth config
    pages: {
      signIn: '/welcome',
      error: '/welcome',
    },
  }
);

export const config = {
  matcher: [
    "/clora/:path*",     // Virtual try-on functionality
    "/profile/:path*",   // User profile pages
    "/settings/:path*",  // User settings
    "/try-on/:path*",    // Try-on related pages
    // Note: subscription, pricing, and product pages are intentionally left unprotected
    // to allow users to browse and subscribe without authentication
  ],
};
