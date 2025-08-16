'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
}

interface AuthContextType {
  user: AuthUser | null;
  sessionData: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use better-auth's useSession hook with correct API
  const { 
    data: sessionData, 
    isPending: isLoading, 
    error: sessionError,
    refetch 
  } = useSession();

  // Combine session error with our error state
  useEffect(() => {
    if (sessionError) {
      setError(sessionError.message || 'Session error');
    } else {
      setError(null);
    }
  }, [sessionError]);

  // Sync user with database when session changes
  useEffect(() => {
    const syncUser = async () => {
      if (!sessionData?.session || !sessionData?.user) {
        setUser(null);
        return;
      }

      try {
        // Try to create user if they don't exist in our database
        const userResponse = await userAPI.createIfNotExists();
        
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        } else {
          // Fallback to session user if API call fails
          setUser(sessionData.user);
        }
      } catch (apiError: any) {
        console.warn('Failed to sync user with database, using session user:', apiError);
        // Use the session user as fallback
        setUser(sessionData.user);
      }
    };

    syncUser();
  }, [sessionData?.session?.id]); // Only depend on session ID to avoid unnecessary calls

  const refreshSession = async () => {
    try {
      await refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to refresh session');
    }
  };

  const contextValue: AuthContextType = {
    user,
    sessionData,
    isLoading,
    isAuthenticated: !!user && !!sessionData?.session,
    error,
    refreshSession,
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
