import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";

export default auth((request: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const role = session?.user?.role;

  const isProtected = pathname.startsWith("/resident") || pathname.startsWith("/admin");
  if (!isProtected) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/resident") && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/resident/:path*", "/admin/:path*"],
};
