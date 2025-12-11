import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_SERVER,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = client;
