import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // For now, skip auth middleware - will add after Prisma is set up
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next|static|public|favicon).*)'],
};
