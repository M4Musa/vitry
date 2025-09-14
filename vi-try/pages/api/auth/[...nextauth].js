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
          return { id: user._id, email: user.email, subscription: user.subscription, name: user.name };
        } else {
          throw new Error('Invalid email or password');
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/welcome',  
  },
  session: {
    jwt: true, 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.subscription = user.subscription;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.subscription = token.subscription;
      session.user.name = token.name;
      // Ensure user properties are properly assigned from token
      return session;
    }
  },
};

export const handler = NextAuth(authOptions);


export default handler;
