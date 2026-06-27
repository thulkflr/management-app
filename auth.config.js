// auth.config.js
import Google from "next-auth/providers/google";

// This config is shared between Middleware and the full Auth logic.
// It must NOT import any Node.js specific libraries.
export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
  ],
  trustHost: true,
  secret: process.env.AUTH_SECRET || "fallback-secret-for-development-only-123456789",
  callbacks: {
    // Only basic JWT/Session logic here if needed for middleware
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
};
