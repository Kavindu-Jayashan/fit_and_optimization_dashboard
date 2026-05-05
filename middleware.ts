import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session_email");
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isRoot = req.nextUrl.pathname === "/";

  if (isRoot) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/jobs", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/jobs/:path*", "/login"],
};
