import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// FIXED: Simple working middleware for both local and Vercel
export default withAuth(
  function middleware(req) {
    // Just let authenticated users through
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Simple check: if there's a token, user is authorized
        return !!token;
      },
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
