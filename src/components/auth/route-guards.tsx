'use client';

import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from './auth-guard';
import { ROLES } from '@/lib/permissions';

// Component to protect routes that require authentication
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

// Component to protect admin-only routes
export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={[ROLES.SUPER_ADMIN]}>{children}</AuthGuard>;
}

// Component to protect Super Admin routes
export function SuperAdminOnlyRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={[ROLES.SUPER_ADMIN]}>{children}</AuthGuard>;
}

// Component to protect Operator-level management (Super Admin, Operator Admin, Operator Manager)
export function OperatorAdminOrAboveRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_MANAGER]}>{children}</AuthGuard>;
}

// Component to protect Operator Staff roles (Super Admin, Operator Admin, Operator Manager, Operator Staff)
export function OperatorStaffOrAboveRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_MANAGER, ROLES.OPERATOR_STAFF]}>{children}</AuthGuard>;
}

// Component to protect Counter Owner roles (Super Admin, Operator Admin, Operator Manager, Counter Owner)
export function CounterOwnerOrAboveRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_MANAGER, ROLES.COUNTER_OWNER]}>{children}</AuthGuard>;
}

// Component to protect Counter Staff roles (Super Admin, Operator Admin, Operator Manager, Counter Owner, Counter Staff)
export function CounterStaffOrAboveRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_MANAGER, ROLES.COUNTER_OWNER, ROLES.COUNTER_STAFF]}>{children}</AuthGuard>;
}

// Component to protect Operator routes
export function OperatorOnlyRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={[ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_MANAGER, ROLES.OPERATOR_STAFF]}>{children}</AuthGuard>;
}

// Component to protect Counter routes
export function CounterOnlyRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={[ROLES.COUNTER_OWNER, ROLES.COUNTER_STAFF]}>{children}</AuthGuard>;
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
    ? isAuthenticated && (!requireAdmin || ['admin', 'SUPER_ADMIN', 'ADMIN'].includes(user?.role || ''))
    : !requireAuth || !isAuthenticated;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
