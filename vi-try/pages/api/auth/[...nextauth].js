import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectMongoDB } from '@/config/mongodb'; 
import bcrypt from 'bcryptjs';
import User from "@/models/user";

// DEPLOYMENT SPECIALIST FIX: Optimized NextAuth for Vercel
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectMongoDB(); 

          const user = await User.findOne({ email: credentials.email });

          if (user && (await bcrypt.compare(credentials.password, user.password))) {
            return { 
              id: user._id.toString(), // Ensure ID is a string for serialization
              email: user.email, 
              subscription: user.subscription, 
              name: user.name 
            };
          } else {
            throw new Error('Invalid email or password');
          }
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed');
        }
      }
    }),
  ],
  
  // Critical: Explicit secret configuration for Vercel
  secret: process.env.NEXTAUTH_SECRET,
  
  // Custom pages
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  // Optimized session configuration for serverless
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  // Critical JWT configuration for Vercel Edge Runtime
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    secret: process.env.NEXTAUTH_SECRET, // Explicit secret
    // Ensure cookies work properly on Vercel
    encode: async ({ secret, token }) => {
      return require('jsonwebtoken').sign(token, secret, {
        algorithm: 'HS256',
        expiresIn: '30d'
      });
    },
    decode: async ({ secret, token }) => {
      try {
        return require('jsonwebtoken').verify(token, secret, {
          algorithms: ['HS256']
        });
      } catch (error) {
        console.error('JWT decode error:', error);
        return null;
      }
    },
  },
  
  // Enhanced cookie configuration for Vercel
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Log for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT Callback - User:', !!user, 'Account:', !!account, 'Token exists:', !!token);
      }
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.subscription = user.subscription;
        token.name = user.name;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('JWT Callback - Setting token data:', { 
            hasId: !!token.id, 
            hasEmail: !!token.email,
            hasName: !!token.name 
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure session has all required data
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.subscription = token.subscription;
        session.user.name = token.name;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Session Callback - Session user:', {
            hasId: !!session.user.id,
            hasEmail: !!session.user.email,
            hasName: !!session.user.name
          });
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Enhanced redirect handling for Vercel
      const allowedOrigins = [
        baseUrl,
        process.env.NEXTAUTH_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      ].filter(Boolean);
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // Check if URL is from allowed origins
      try {
        const urlOrigin = new URL(url).origin;
        if (allowedOrigins.includes(urlOrigin)) {
          return url;
        }
      } catch (e) {
        // Invalid URL, fallback to baseUrl
      }
      
      return baseUrl;
    }
  },
};

export const handler = NextAuth(authOptions);


export default handler;
