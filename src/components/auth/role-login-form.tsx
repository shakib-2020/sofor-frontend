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
    <div className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
      <div className="p-8 pb-6">
        <div>
          <h1 className="mt-4 mb-1 font-semibold text-xl">
            {portalName}
          </h1>
          <p className="text-sm">Please sign in with your authorized credentials.</p>
        </div>

        {authError && (
          <div className="mt-4 flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div>{authError}</div>
          </div>
        )}

        <hr className="my-4 border-dashed" />

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="block text-sm" htmlFor="email">
              Work Email
            </Label>
            <Input
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              type="email"
            />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-title" htmlFor="password">
                Password
              </Label>
              <Button asChild size="sm" variant="link">
                <Link
                  className="link intent-info variant-ghost text-sm"
                  href="/forget-password"
                >
                  Forgot your Password ?
                </Link>
              </Button>
            </div>
            <Input
              className="input sz-md variant-mixed"
              id="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              type="password"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              onClick={() => {
                setRememberMe(!rememberMe);
              }}
            />
            <Label htmlFor="remember">Remember me</Label>
          </div>

          <Button
            className="w-full"
            disabled={loading}
            onClick={handleLogin}
            type="button"
          >
            {loading ? (
              <Loader2 className="animate-spin text-white" size={16} />
            ) : (
              'Sign In to Portal'
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-(--radius) border bg-muted p-3">
        <p className="text-center text-accent-foreground text-sm flex justify-center gap-2">
          <Link className="hover:underline" href="/sign-in">
            Passenger Login
          </Link>
        </p>
      </div>
    </div>
  );
}
