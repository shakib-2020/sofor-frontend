import { getCookieCache } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';


export async function middleware(request: NextRequest) {
  const session = await getCookieCache(request);
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/my-bookings/:path*'], // Specify the routes the middleware applies to
};
