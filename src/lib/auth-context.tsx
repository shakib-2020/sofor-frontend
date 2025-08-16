'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth-client';
import { userAPI } from '@/lib/api';

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
  session?: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user?: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  sessionData: SessionData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearAuth = useCallback(() => {
    setUser(null);
    setSessionData(null);
    setError(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the current session
      const response = await getSession();
      
      if (!response?.data) {
        clearAuth();
        return;
      }

      setSessionData(response.data);

      // If we have session data but no user, try to create/get user from our database
      if (response.data.session && response.data.user) {
        try {
          // Try to create user if they don't exist in our database
          const userResponse = await userAPI.createIfNotExists();
          
          if (userResponse.data.success) {
            setUser(userResponse.data.user);
          } else {
            // Fallback to session user if API call fails
            setUser(response.data.user);
          }
        } catch (apiError: any) {
          console.warn('Failed to sync user with database, using session user:', apiError);
          // Use the session user as fallback
          setUser(response.data.user);
        }
      } else {
        setUser(null);
      }
    } catch (sessionError: any) {
      console.error('Failed to refresh session:', sessionError);
      setError(sessionError.message || 'Failed to authenticate');
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuth]);

  // Initialize auth state on mount
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Auto-refresh session periodically (every 5 minutes)
  useEffect(() => {
    if (!sessionData?.session) return;

    const interval = setInterval(() => {
      refreshSession();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [sessionData?.session, refreshSession]);

  const contextValue: AuthContextType = {
    user,
    sessionData,
    isLoading,
    isAuthenticated: !!user && !!sessionData?.session,
    error,
    refreshSession,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
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
