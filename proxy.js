import { NextResponse } from "next/server";

import { hasValidSession } from "@/lib/auth/session";

const AUTH_PATHS = ["/login", "/register"];

function isProtectedPath(pathname) {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/channels")
  );
}

function isAuthPath(pathname) {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const authenticated = await hasValidSession(request);

  if (isProtectedPath(pathname) && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPath(pathname) && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
