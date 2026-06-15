'use client';

import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signOut } from '@/lib/auth-client';
import { _log } from '@/lib/logs';

interface RoleLoginFormProps {
  allowedRoles: string[];
  portalName: string;
  redirectPath: string;
  themeColor?: string; // e.g. 'indigo', 'emerald', 'sky'
  bgGradient?: string;
}

export default function RoleLoginForm({
  allowedRoles,
  portalName,
  redirectPath,
  themeColor = 'blue',
  bgGradient = 'from-blue-600 to-indigo-700',
}: RoleLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, startTransition] = useTransition();
  const [rememberMe, setRememberMe] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = () => {
    if (!(email && password)) {
      toast.error('Please fill in all fields');
      return;
    }
    setAuthError(null);
    startTransition(async () => {
      await signIn.email(
        { email, password, rememberMe },
        {
          onSuccess: async (ctx) => {
            const user = ctx.data.user;
            const role = user?.role || 'CUSTOMER';

            // Check if the user's role is allowed in this portal
            if (!allowedRoles.includes(role)) {
              setAuthError(`Access Denied: Your account (${role}) is not authorized to access the ${portalName}.`);
              toast.error('Unauthorized access');
              // Automatically sign out of the unauthorized session
              await signOut();
              return;
            }

            toast.success(`Welcome back, ${user.name || 'User'}!`);
            router.push(redirectPath);
          },
          onError: (ctx) => {
            _log(ctx);
            setAuthError(ctx.error.message || 'Invalid email or password');
            toast.error(ctx.error.message || 'Login failed');
          },
        }
      );
    });
  };

  return (
    <div className="m-auto h-fit w-full max-w-md rounded-2xl border border-white/10 bg-card/65 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-indigo-500/5">
      {/* Decorative top accent gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${bgGradient}`} />

      <div className="mb-6 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Portal Icon</title>
            <path
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {portalName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Please sign in with your authorized credentials.
        </p>
      </div>

      {authError && (
        <div className="mb-5 flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div>{authError}</div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Work Email</Label>
          <Input
            className="rounded-lg"
            id="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            type="email"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            className="rounded-lg"
            id="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            type="password"
          />
        </div>

        <div className="flex items-center gap-2 py-1">
          <Checkbox
            id="remember"
            onClick={() => {
              setRememberMe(!rememberMe);
            }}
          />
          <Label className="text-sm cursor-pointer select-none" htmlFor="remember">
            Keep me signed in
          </Label>
        </div>

        <Button
          className={`w-full text-white font-medium rounded-lg h-11 transition-all duration-200 bg-gradient-to-r ${bgGradient} hover:opacity-95 shadow-md`}
          disabled={loading}
          onClick={handleLogin}
          type="button"
        >
          {loading ? (
            <Loader2 className="animate-spin text-white" size={18} />
          ) : (
            'Sign In to Portal'
          )}
        </Button>
      </div>

      <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border/50 pt-4 flex justify-between">
        <Link className="hover:underline hover:text-foreground" href="/sign-in">
          Passenger Login
        </Link>
        <Link className="hover:underline hover:text-foreground" href="/forget-password">
          Forgot Password?
        </Link>
      </div>
    </div>
  );
}
