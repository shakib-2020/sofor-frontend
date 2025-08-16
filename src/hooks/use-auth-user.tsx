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
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
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
