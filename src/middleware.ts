import { getCookieCache } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const session = await getCookieCache(request, {
      secret: process.env.BETTER_AUTH_SECRET,
      isSecure: process.env.NODE_ENV === "production",
    });
    

    console.log('===========session', session);

    if (!session) {
      const signInUrl = new URL("/sign-in", request.url);
      // Add redirect parameter to handle post-auth navigation
      signInUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth error:', error);
    // On error, redirect to sign-in
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',  // Protect all dashboard routes
    '/profile/:path*',    // Protect all profile routes
    '/my-bookings/:path*' // Protect booking routes
  ],
};
