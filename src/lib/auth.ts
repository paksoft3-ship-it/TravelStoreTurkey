import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // Hardcoded admin login — works without a database (demo / local use).
        // Override via ADMIN_EMAIL / ADMIN_PASSWORD env vars in production.
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@travelstoreturkey.com';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TravelStore2026';
        if (
          credentials.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
          credentials.password === ADMIN_PASSWORD
        ) {
          return {
            id: 'admin',
            email: ADMIN_EMAIL,
            name: 'TravelStore Turkey Admin',
            role: 'ADMIN',
            image: null,
          };
        }

        // Fall back to database-backed users when a database is configured.
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (
            user &&
            user.password &&
            (await compare(credentials.password, user.password))
          ) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
            };
          }
        } catch {
          // database unavailable — only the hardcoded admin login works
        }

        throw new Error('Invalid credentials');
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
