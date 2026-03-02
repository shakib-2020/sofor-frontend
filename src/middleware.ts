import { betterFetch } from '@better-fetch/fetch';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type { client } from '@/lib/auth-client';

type Session = typeof client.$Infer.Session;
export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    '/api/auth/get-session',
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get('cookie') || '', // Forward the cookies from the request
      },
    }
  );

  console.log('session in middleware', (await headers()).get('cookie'));
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/my-bookings/:path*'], // Specify the routes the middleware applies to
};
