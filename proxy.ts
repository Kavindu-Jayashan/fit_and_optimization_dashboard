import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isRoot = req.nextUrl.pathname === "/";
  const Session = req.auth;

  if (isRoot) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!Session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (Session && isLoginPage) {
    return NextResponse.redirect(new URL("/jobs", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/jobs/:path*", "/login"],
};
