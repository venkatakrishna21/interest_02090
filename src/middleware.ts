import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files, API, auth, and login
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  // ✅ Protect /owner and /customer routes
  const accessToken = req.cookies.get("sb-access-token");
  if (!accessToken && (pathname.startsWith("/owner") || pathname.startsWith("/customer"))) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/customer/:path*"],
};
