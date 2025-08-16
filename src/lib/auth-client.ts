import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const client = createAuthClient({
  // No baseURL needed - use Next.js proxy rewrite
  // This ensures all requests go through /api/auth/* which gets proxied to your backend
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, getSession } = client;
