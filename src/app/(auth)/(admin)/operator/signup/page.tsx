'use client';

import Link from 'next/link';
import { ShieldAlert, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BusOwnerSignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-zinc-900 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <span className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            SOFOR
          </span>
          <span className="block text-xs uppercase tracking-widest text-slate-400 mt-1">
            Operator Registration
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/65 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-red-600" />

          <div className="mb-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 mb-3">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Registration Restricted
            </h1>
            <p className="text-sm text-muted-foreground mt-2 px-2">
              Public self-registration for bus operators is disabled to ensure platform verification and security.
            </p>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-300">
              Please contact the system administrator to register your bus company and set up your operator account.
            </p>

            <Link href="/operator/login" passHref className="block">
              <Button className="w-full text-white font-medium rounded-lg h-11 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 shadow-md mt-4">
                <LogIn className="mr-2 h-4 w-4" /> Go to Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border/50 pt-4">
            Authorized admin?{' '}
            <Link className="underline hover:text-foreground text-emerald-400" href="/operator/login">
              Operator Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
