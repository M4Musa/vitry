import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  try {
    // Only allow this endpoint in development or when explicitly enabled
    if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_DEBUG_ENDPOINTS) {
      return res.status(404).json({ error: 'Not found' });
    }

    const session = await getServerSession(req, res, authOptions);
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasSession: !!session,
      hasToken: !!token,
      sessionUser: session?.user ? {
        hasId: !!session.user.id,
        hasEmail: !!session.user.email,
        hasName: !!session.user.name,
        email: session.user.email, // Only show in debug
      } : null,
      tokenData: token ? {
        hasId: !!token.id,
        hasEmail: !!token.email,
        hasName: !!token.name,
        email: token.email, // Only show in debug
        iat: token.iat,
        exp: token.exp,
      } : null,
      cookies: Object.keys(req.cookies).filter(key => 
        key.includes('next-auth') || key.includes('session')
      ),
      headers: {
        host: req.headers.host,
        userAgent: req.headers['user-agent']?.substring(0, 50) + '...',
        referer: req.headers.referer,
      },
      environment_vars: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasVercelUrl: !!process.env.VERCEL_URL,
        vercelUrl: process.env.VERCEL_URL,
      }
    };

    return res.status(200).json(debugInfo);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return res.status(500).json({ 
      error: 'Debug endpoint failed', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}