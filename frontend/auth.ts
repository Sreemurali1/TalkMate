import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      // On first sign-in, exchange the Google profile for a backend JWT
      if (account?.provider === 'google' && profile) {
        try {
          const backendUrl =
            process.env.NEST_INTERNAL_URL ?? 'http://localhost:3001';

          const res = await fetch(`${backendUrl}/auth/google/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleId: profile.sub,
              email: profile.email,
              name: profile.name,
              avatarUrl: (profile as Record<string, unknown>).picture,
            }),
          });

          if (res.ok) {
            const data = (await res.json()) as { accessToken: string };
            token.backendToken = data.accessToken;
          }
        } catch {
          // Non-fatal — backendToken will be absent
        }
      }
      return token;
    },

    async session({ session, token }) {
      (session as typeof session & { backendToken?: string }).backendToken =
        token.backendToken as string | undefined;
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
});
