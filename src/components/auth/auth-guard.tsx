
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  allowedRoles?: string[];
  requireAdmin?: boolean;
}

export function AuthGuard({ children, redirectTo = '/sign-in', allowedRoles, requireAdmin = false }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check roles requirement
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user?.role || 'CUSTOMER';
        if (!allowedRoles.includes(userRole)) {
          router.push('/'); // Redirect to home if role not allowed
          return;
        }
      } else if (requireAdmin && user?.role !== 'SUPER_ADMIN') {
        router.push('/'); // Redirect to home if admin required but not super admin
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router, redirectTo, allowedRoles, requireAdmin]);

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

  // Check role eligibility for render check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'CUSTOMER';
    if (!allowedRoles.includes(userRole)) {
      return null;
    }
  } else if (requireAdmin && user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return <>{children}</>;
}


