'use client';

// import { signUp } from "@/lib/actions";
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp } from '@/lib/auth-client';
import { _log } from '@/lib/logs';

export default function RegisterForm() {
  // const initialState = { errorMessage: "" };
  // const [state, formAction, pending] = useActionState(signUp, initialState);

  // useEffect(() => {
  //   if (state.errorMessage.length) {
  //     toast.error(state.errorMessage);
  //   }
  // }, [state.errorMessage]);

  const [name, _setName] = useState('Admin User');
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  const handlSignUp = () => {
    if (email && password) {
      _log({ email, password, name });
      const user = signUp.email({
        email,
        password,
        name,
        callbackURL: '/',
      });
      _log({ user });
    }
  };

  return (
    <form
      // action={formAction}
      className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
    >
      <div className="p-8 pb-6">
        <div>
          <Link aria-label="go home" href="/">
            Sofor-🚌
          </Link>
          <h1 className="mt-4 mb-1 text-xl font-semibold text-title">
            Create a Tailark Account
          </h1>
          <p className="text-sm">Welcome! Create an account to get started</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button type="button" variant="outline">
            <svg
              height="1em"
              viewBox="0 0 256 262"
              width="0.98em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                fill="#4285f4"
              />
              <path
                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                fill="#34a853"
              />
              <path
                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                fill="#fbbc05"
              />
              <path
                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                fill="#eb4335"
              />
            </svg>
            <span>Google</span>
          </Button>
          <Button type="button" variant="outline">
            <svg
              height="1em"
              viewBox="0 0 256 256"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M121.666 121.666H0V0h121.666z" fill="#f1511b" />
              <path d="M256 121.666H134.335V0H256z" fill="#80cc28" />
              <path d="M121.663 256.002H0V134.336h121.663z" fill="#00adef" />
              <path d="M256 256.002H134.335V134.336H256z" fill="#fbbc09" />
            </svg>
            <span>Microsoft</span>
          </Button>
        </div>

        <hr className="my-4 border-dashed" />

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="block text-sm" htmlFor="firstname">
                Firstname
              </Label>
              <Input id="firstname" name="firstname" required type="text" />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm" htmlFor="lastname">
                Lastname
              </Label>
              <Input id="lastname" name="lastname" required type="text" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="block text-sm" htmlFor="email">
              Username
            </Label>
            <Input
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-title" htmlFor="password">
              Password
            </Label>
            <Input
              className="input sz-md variant-mixed"
              id="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
            />
          </div>

          <Button className="w-full" onClick={handlSignUp}>
            Continue
          </Button>
        </div>
      </div>

      <div className="rounded-(--radius) border bg-muted p-3">
        <p className="text-sm text-center text-accent-foreground">
          Have an account ?
          <Button asChild className="px-2" variant="link">
            <Link href="/signin">Sign In</Link>
          </Button>
        </p>
      </div>
    </form>
  );
}
