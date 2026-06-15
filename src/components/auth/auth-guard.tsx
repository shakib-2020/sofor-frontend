
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
        const effectiveAllowedRoles = [...allowedRoles];
        if (allowedRoles.includes('superAdmin') || allowedRoles.includes('SUPER_ADMIN')) {
          effectiveAllowedRoles.push('superAdmin', 'SUPER_ADMIN', 'admin', 'ADMIN');
        }
        if (allowedRoles.includes('admin') || allowedRoles.includes('ADMIN')) {
          effectiveAllowedRoles.push('superAdmin', 'SUPER_ADMIN', 'admin', 'ADMIN');
        }

        if (!effectiveAllowedRoles.includes(userRole)) {
          router.push('/'); // Redirect to home if role not allowed
          return;
        }
      } else if (requireAdmin) {
        const userRole = user?.role || 'CUSTOMER';
        if (userRole !== 'SUPER_ADMIN' && userRole !== 'superAdmin' && userRole !== 'ADMIN' && userRole !== 'admin') {
          router.push('/'); // Redirect to home if admin required but not admin/superAdmin
          return;
        }
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
    const effectiveAllowedRoles = [...allowedRoles];
    if (allowedRoles.includes('superAdmin') || allowedRoles.includes('SUPER_ADMIN')) {
      effectiveAllowedRoles.push('superAdmin', 'SUPER_ADMIN', 'admin', 'ADMIN');
    }
    if (allowedRoles.includes('admin') || allowedRoles.includes('ADMIN')) {
      effectiveAllowedRoles.push('superAdmin', 'SUPER_ADMIN', 'admin', 'ADMIN');
    }
    if (!effectiveAllowedRoles.includes(userRole)) {
      return null;
    }
  } else if (requireAdmin) {
    const userRole = user?.role || 'CUSTOMER';
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'superAdmin' && userRole !== 'ADMIN' && userRole !== 'admin') {
      return null;
    }
  }

  return <>{children}</>;
}


