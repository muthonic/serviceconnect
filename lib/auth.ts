import { UserRole } from '@prisma/client';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma';
import { compare } from 'bcryptjs';

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    }
  }
  interface User {
    role: UserRole;
  }
}

// NextAuth Configuration
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('Starting authorization...');
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            throw new Error('Missing credentials');
          }

          console.log('Looking up user:', credentials.email);
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            console.log('User not found');
            throw new Error('User not found');
          }

          console.log('Verifying password');
          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log('Invalid password');
            throw new Error('Invalid password');
          }

          console.log('Login successful for user:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      try {
        console.log('Session callback - token:', token);
        console.log('Session callback - initial session:', session);
        
        if (token) {
          session.user = {
            id: token.id as string,
            email: token.email as string,
            name: token.name as string,
            role: token.role as UserRole,
          };
          console.log('Session callback - final session:', session);
        }
        
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        throw error;
      }
    },
    async redirect({ url, baseUrl }) {
      // Ensure we have a valid base URL
      const validBaseUrl = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      
      // If the URL is relative, make it absolute
      if (url.startsWith('/')) {
        return `${validBaseUrl}${url}`;
      }
      
      // If the URL is absolute but from the same origin, allow it
      if (url.startsWith(validBaseUrl)) {
        return url;
      }
      
      // Default to the base URL
      return validBaseUrl;
    },
  },
}; 