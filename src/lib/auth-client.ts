import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword,
} = createAuthClient({
  /** the base url of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_BETTER_SERVER,
  plugins: [adminClient()],
});
