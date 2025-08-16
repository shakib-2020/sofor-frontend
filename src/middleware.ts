import { getCookieCache, getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Get session cookie from request
    const cookies = getSessionCookie(request);
    
    console.log('===========session cookies:', cookies);

    // If no session cookie found, redirect to sign-in
    if (!cookies) {
      const signInUrl = new URL("/sign-in", request.url);
      // Add redirect parameter to handle post-auth navigation
      signInUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth error:', error);
    // On error, redirect to sign-in
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',  // Protect all dashboard routes
    '/profile/:path*',    // Protect all profile routes
    '/my-bookings/:path*' // Protect booking routes
  ],
  // runtime: "nodejs"
};
