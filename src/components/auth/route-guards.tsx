'use client';

import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from './auth-guard';

// Component to protect routes that require authentication
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

// Component to protect admin-only routes
export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard requireAdmin>{children}</AuthGuard>;
}

// Component to redirect authenticated users away from auth pages
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to home
  if (isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  return <>{children}</>;
}

// Higher-order component for conditional rendering based on auth
export function ConditionalAuth({
  children,
  fallback,
  requireAuth = true,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback || <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>;
  }

  const hasAccess = requireAuth 
    ? isAuthenticated && (!requireAdmin || user?.role === 'admin')
    : !requireAuth || !isAuthenticated;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
