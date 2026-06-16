import LoginForm from '@/components/auth/login-form';
import { Suspense } from 'react';

function SignInPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8 bg-card rounded-lg border shadow-md">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

export default SignInPage;
