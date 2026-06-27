// auth.js
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { authService } from "@/services/authService";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // This runs on the server (Node.js runtime) during the sign-in flow.
        const { isAllowed, userData } = await authService.isUserAllowed(user.email);
        
        if (isAllowed) {
            user.role = userData.role;
            return true;
        }
        return false; 
      }
      return false;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Use the secret from authConfig (which has the fallback)
});
