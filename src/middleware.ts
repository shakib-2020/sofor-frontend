import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';


export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  console.log('session in middleware', sessionCookie);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/my-bookings/:path*'], // Specify the routes the middleware applies to
};
