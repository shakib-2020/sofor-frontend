import { getCookieCache } from 'better-auth/cookies';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await getCookieCache(request);
  
  console.log("================== Session:", session);
  
	if (!session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
	return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/profile'],
};
