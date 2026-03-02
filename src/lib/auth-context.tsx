'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSession } from '@/lib/auth-client';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
}

interface SessionData {
  session: {
    id: string;
    [key: string]: unknown;
  } | null;
  user: AuthUser | null;
}

interface AuthContextType {
  user: AuthUser | null;
  sessionData: SessionData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [error, setError] = useState<string | null>(null);

  // Use better-auth's useSession hook - this is the source of truth
  const {
    data: sessionData,
    isPending: isLoading,
    error: sessionError,
    refetch,
  } = useSession();

  // Handle session errors
  useEffect(() => {
    if (sessionError) {
      setError(sessionError.message || 'Session error');
    } else {
      setError(null);
    }
  }, [sessionError]);

  const refreshSession = async () => {
    try {
      await refetch();
    } catch (err: unknown) {
      const refreshError = err as { message?: string };
      setError(refreshError.message || 'Failed to refresh session');
    }
  };

  // Authentication status based on Better Auth session data
  const isAuthenticated = !!sessionData?.session && !!sessionData?.user;

  const contextValue: AuthContextType = {
    user: sessionData?.user || null,
    sessionData: sessionData || null,
    isLoading,
    isAuthenticated,
    error,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hook for checking if user is authenticated
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// Convenience hook for getting current user
export function useCurrentUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}
