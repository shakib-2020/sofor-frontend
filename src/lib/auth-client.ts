import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const client = createAuthClient({
  /** the base url of the server (optional if you're using the same domain) */
  // baseURL: process.env.NEXT_PUBLIC_BETTER_SERVER, no need,  use nextjs rewrite as proxy
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = client;
