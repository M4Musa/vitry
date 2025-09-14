import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  try {
    // Allow in development or when explicitly enabled
    if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_DEBUG_ENDPOINTS) {
      return res.status(404).json({ error: 'Debug endpoint disabled in production' });
    }

    const session = await getServerSession(req, res, authOptions);
    
    // Try multiple cookie names for token detection
    const tokenConfigs = [
      { req, secret: process.env.NEXTAUTH_SECRET },
      { 
        req, 
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production',
        cookieName: process.env.NODE_ENV === 'production' 
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token'
      }
    ];
    
    let token = null;
    for (const config of tokenConfigs) {
      try {
        token = await getToken(config);
        if (token) break;
      } catch (e) {
        // Try next config
      }
    }

    // Comprehensive debug information for Vercel deployment
    const debugInfo = {
      timestamp: new Date().toISOString(),
      deployment: {
        environment: process.env.NODE_ENV,
        platform: process.env.VERCEL ? 'Vercel' : 'Other',
        region: process.env.VERCEL_REGION || 'unknown',
        deployment_url: process.env.VERCEL_URL,
      },
      authentication: {
        hasSession: !!session,
        hasToken: !!token,
        sessionStatus: session ? 'valid' : 'none',
        tokenStatus: token ? 'valid' : 'none',
      },
      sessionData: session?.user ? {
        hasId: !!session.user.id,
        hasEmail: !!session.user.email,
        hasName: !!session.user.name,
        email: session.user.email?.substring(0, 3) + '***', // Partially hide
      } : null,
      tokenData: token ? {
        hasId: !!token.id,
        hasEmail: !!token.email,
        hasName: !!token.name,
        email: token.email?.substring(0, 3) + '***', // Partially hide
        iat: token.iat ? new Date(token.iat * 1000).toISOString() : null,
        exp: token.exp ? new Date(token.exp * 1000).toISOString() : null,
        isExpired: token.exp ? token.exp < Math.floor(Date.now() / 1000) : null,
      } : null,
      cookies: {
        authCookies: Object.keys(req.cookies)
          .filter(key => key.includes('next-auth') || key.includes('session'))
          .reduce((acc, key) => {
            acc[key] = req.cookies[key] ? 'present' : 'absent';
            return acc;
          }, {}),
        totalCookies: Object.keys(req.cookies).length,
      },
      request: {
        method: req.method,
        url: req.url,
        host: req.headers.host,
        userAgent: req.headers['user-agent']?.substring(0, 100) + '...',
        referer: req.headers.referer,
        origin: req.headers.origin,
      },
      environment_vars: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasVercelUrl: !!process.env.VERCEL_URL,
        vercelUrl: process.env.VERCEL_URL,
        nodeEnv: process.env.NODE_ENV,
        hasStripeKeys: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY),
      },
      middleware_test: {
        protectedRoutes: ['/clora', '/profile', '/settings', '/try-on', '/subscription'],
        currentPath: req.url,
        shouldBeProtected: ['/clora', '/profile', '/settings', '/try-on', '/subscription']
          .some(route => req.url?.startsWith(route)),
      }
    };

    return res.status(200).json(debugInfo);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return res.status(500).json({ 
      error: 'Debug endpoint failed', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
