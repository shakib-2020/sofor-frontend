'use client';

import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp, signIn } from '@/lib/auth-client';
// import { _log } from '@/lib/logs';
import { convertImageToBase64 } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';

export default function RegisterForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const signInWithGoogle = async () => {
    const nextCallbackUrl = callbackUrl.includes('?') 
      ? `${callbackUrl}&login=success` 
      : `${callbackUrl}?login=success`;
    const data = await signIn.social({
      provider: "google",
      callbackURL: nextCallbackUrl,
    });
    if (data.error) {
      toast.error(data.error.message);
    }
  };

  const handlSignUp = async () => {
    await signUp.email({
      email,
      password,
      name: `${firstName} ${lastName}`,
      image: image ? await convertImageToBase64(image) : '',
      callbackURL: callbackUrl,
      fetchOptions: {
        onResponse: () => {
          setLoading(false);
        },
        onRequest: () => {
          setLoading(true);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: async () => {
          await router.push(callbackUrl);
        },
      },
    });
  };

  return (
    <div
      // action={formAction}
      className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
    >
      <div className="p-8 pb-6">
        <div>
          <Link aria-label="go home" href="/">
            <div className="flex flex-col items-center mb-6">
              <Logo className="h-10 w-auto mb-4" />
              <h1 className="font-semibold text-xl text-center">
                Sign Up for Sofor
              </h1>
              <p className="text-sm text-center">Create an account to get started</p>
            </div>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <Button onClick={signInWithGoogle} type="button" variant="outline">
            <svg
              height="1em"
              viewBox="0 0 256 262"
              width="0.98em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>""</title>
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
        </div>

        <hr className="my-4 border-dashed" />

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
                placeholder="Max"
                required
                value={firstName}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
                placeholder="Robinson"
                required
                value={lastName}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="block text-sm" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com"
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
              placeholder="Password"
              required
              type="password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Confirm Password</Label>
            <Input
              autoComplete="new-password"
              id="password_confirmation"
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Confirm Password"
              type="password"
              value={passwordConfirmation}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Profile Image (optional)</Label>
            <div className="flex items-end gap-4">
              {imagePreview && (
                <div className="relative h-16 w-16 overflow-hidden rounded-sm">
                  <Image
                    alt="Profile preview"
                    layout="fill"
                    objectFit="cover"
                    src={imagePreview}
                  />
                </div>
              )}
              <div className="flex w-full items-center gap-2">
                <Input
                  accept="image/*"
                  className="w-full"
                  id="image"
                  onChange={handleImageChange}
                  type="file"
                />
                {imagePreview && (
                  <X
                    className="cursor-pointer"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            disabled={loading}
            onClick={handlSignUp}
            type="submit"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-(--radius) border bg-muted p-3">
        <p className="text-center text-accent-foreground text-sm">
          Have an account ?
          <Button asChild className="px-2" variant="link">
            <Link href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}>Sign In</Link>
          </Button>
        </p>
      </div>
    </div>
  );
}
