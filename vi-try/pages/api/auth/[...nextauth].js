import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectMongoDB } from '@/config/mongodb'; 
import bcrypt from 'bcryptjs';
import User from "@/models/user";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectMongoDB(); 

        const user = await User.findOne({ email: credentials.email });

        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return { 
            id: user._id.toString(), // Ensure ID is a string for better serialization
            email: user.email, 
            subscription: user.subscription, 
            name: user.name 
          };
        } else {
          throw new Error('Invalid email or password');
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // Enhanced JWT configuration for Vercel
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Ensure JWT secret is properly set
    secret: process.env.NEXTAUTH_SECRET,
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
