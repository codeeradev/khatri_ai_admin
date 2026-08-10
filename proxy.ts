import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/token";

const protectedRoutes = ["/dashboard", "/greetings", "/menu", "/knowledge", "/settings"];

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const authenticated = verifySessionToken(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (isProtected && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/greetings/:path*", "/menu/:path*", "/knowledge/:path*", "/settings/:path*", "/login"],
};
