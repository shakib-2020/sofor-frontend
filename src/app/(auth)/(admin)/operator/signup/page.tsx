'use client';

import Link from 'next/link';
import { ShieldAlert, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BusOwnerSignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl flex justify-center">
        <div className="w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
          <div className="p-8 pb-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-3">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-xl font-semibold mb-2">
              Registration Restricted
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Public self-registration for bus operators is disabled to ensure platform verification and security. Please contact the system administrator.
            </p>

            <Link href="/operator/login" passHref className="block">
              <Button className="w-full">
                <LogIn className="mr-2 h-4 w-4" /> Go to Sign In
              </Button>
            </Link>
          </div>
          <div className="rounded-(--radius) border bg-muted p-3">
            <p className="text-center text-accent-foreground text-sm flex justify-center gap-2">
              Authorized admin?{' '}
              <Link className="hover:underline" href="/operator/login">
                Operator Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
