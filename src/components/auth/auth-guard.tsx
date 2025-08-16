
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, redirectTo = '/sign-in', requireAdmin = false }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check admin requirement
      if (requireAdmin && user?.role !== 'admin') {
        router.push('/'); // Redirect to home if not admin
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router, redirectTo, requireAdmin]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if admin is required but user is not admin
  if (requireAdmin && user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}


