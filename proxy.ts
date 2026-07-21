import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Clerk routes are preserved for future use, but middleware is disabled
// so the app can continue using its existing auth flow.
export default function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
