'use client';

import { useAuth } from '@/lib/auth-context';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
}

export function useAuthUser() {
  const { user, isLoading, error, isAuthenticated } = useAuth();

  return {
    user,
    isLoading,
    error,
    isAuthenticated
  };
}
