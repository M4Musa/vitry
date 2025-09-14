import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Enhanced middleware for Vercel deployment
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Only log in development to avoid production log spam
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Protecting route: ${pathname}`);
    }
    
    // Add headers for better CORS and session handling in production
    const response = NextResponse.next();
    
    // Set SameSite and Secure attributes for production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('x-middleware-cache', 'no-cache');
    }
    
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        try {
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Auth Check] Path: ${pathname}, Has token: ${!!token}`);
            if (token) {
              console.log(`[Auth Check] Token details:`, { 
                hasId: !!token.id, 
                hasEmail: !!token.email, 
                hasName: !!token.name 
              });
            }
          }
          
          // For Vercel deployment, be more lenient with token validation
          if (token && (token.email || token.id)) {
            return true;
          }
          
          // Log token issues in production for debugging
          if (process.env.NODE_ENV === 'production' && !token) {
            console.log(`[Auth] No token found for protected route: ${pathname}`);
          }
          
          return false;
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
    // Add JWT configuration for better token handling
    jwt: {
      // Use the same secret as NextAuth
      secret: process.env.NEXTAUTH_SECRET,
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
