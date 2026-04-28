import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth Client Configuration
 * 
 * In browser: Routes through /api/auth proxy (same-origin, avoids CORS)
 * In server/build: No baseURL to avoid validation errors during prerendering
 * 
 * The baseURL must be a full URL (not relative path), so we construct it
 * dynamically from the current origin at runtime.
 */
export const client = createAuthClient({
  baseURL: typeof window !== 'undefined' 
    ? `${window.location.origin}/api/auth`
    : undefined,
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = client;
