import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string;
      role: string;
    };
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: '이메일', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Demo accounts for testing without database
        const demoAccounts: Record<string, any> = {
          'admin@example.com': {
            id: '1',
            email: 'admin@example.com',
            name: '관리자',
            role: 'ADMIN',
          },
          'manager@example.com': {
            id: '2',
            email: 'manager@example.com',
            name: '팀장',
            role: 'MANAGER',
          },
          'member@example.com': {
            id: '3',
            email: 'member@example.com',
            name: '팀원',
            role: 'MEMBER',
          },
        };

        const email = credentials.email as string;
        if (demoAccounts[email]) {
          return demoAccounts[email];
        }

        if (!prisma) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
