import { getCookieCache } from 'better-auth/cookies';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await getCookieCache(request, {
	secret: process.env.BETTER_AUTH_SECRET,
	isSecure: process.env.NODE_ENV === "production",
  });
  
	if (!session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
	return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/profile'],
};
