import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const client = createAuthClient({
  baseURL: '/api/auth',
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = client;
