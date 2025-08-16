'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { userAPI } from '@/lib/api';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function useAuthUser() {
  const { data: session, isPending : sessionLoading } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ensureUserExists = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Try to create user if they don't exist in our database
        const response = await userAPI.createIfNotExists();
        
        if (response.data.success) {
          setUser(response.data.user);
          setError(null);
        }
      } catch (err: any) {
        console.error('Failed to ensure user exists:', err);
        setError(err.response?.data?.message || 'Failed to authenticate user');
        
        // If user creation fails, we can still use the session user
        if (session.user) {
          setUser(session.user as AuthUser);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!sessionLoading) {
      ensureUserExists();
    }
  }, [session, sessionLoading]);

  return {
    user,
    isLoading: sessionLoading || isLoading,
    error,
    isAuthenticated: !!user
  };
}
