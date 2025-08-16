

import { getSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const session = getSession();


  if (!session) {
    redirect('/sign-in');
  }

  return <>{children}</>;
}


