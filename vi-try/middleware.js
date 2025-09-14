import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// DEPLOYMENT SPECIALIST FIX: Custom middleware for Vercel serverless environment
export default async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/clora',
    '/profile', 
    '/settings',
    '/try-on',
    '/subscription'
  ];
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // If not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  try {
    // Get the token using NextAuth JWT with explicit configuration
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
      cookieName: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'
    });
    
    // Enhanced logging for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Checking route: ${pathname}`);
      console.log(`[Middleware] Token exists: ${!!token}`);
      if (token) {
        console.log(`[Middleware] Token data:`, {
          hasId: !!token.id,
          hasEmail: !!token.email,
          hasName: !!token.name,
          exp: token.exp,
          iat: token.iat
        });
      }
    }
    
    // Production logging for Vercel debugging
    if (process.env.NODE_ENV === 'production') {
      console.log(`[Middleware] Route: ${pathname}, Auth: ${!!token}`);
    }
    
    // Check if user is authenticated
    if (!token) {
      console.log(`[Middleware] Redirecting unauthenticated user from ${pathname} to /login`);
      
      // Redirect to login with the original URL as a callback
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      
      return NextResponse.redirect(loginUrl);
    }
    
    // Check token validity (not expired)
    const currentTime = Math.floor(Date.now() / 1000);
    if (token.exp && token.exp < currentTime) {
      console.log(`[Middleware] Token expired for ${pathname}`);
      
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      loginUrl.searchParams.set('error', 'SessionExpired');
      
      return NextResponse.redirect(loginUrl);
    }
    
    // User is authenticated, allow access
    const response = NextResponse.next();
    
    // Add security headers for authenticated routes
    response.headers.set('X-Authenticated', 'true');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
    
  } catch (error) {
    // Log the error for debugging
    console.error('[Middleware Error]:', {
      error: error.message,
      pathname,
      stack: error.stack
    });
    
    // On error, redirect to login to be safe
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'AuthError');
    
    return NextResponse.redirect(loginUrl);
  }
}

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
