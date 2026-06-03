import { NextRequest, NextResponse } from "next/server";

const isAdminRoute = (pathname: string) => pathname.startsWith("/admin") && pathname !== "/admin/login";
const isLoginPage = (pathname: string) => pathname === "/admin/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page without auth
  if (isLoginPage(pathname)) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (isAdminRoute(pathname)) {
    const token = request.cookies.get("access_token")?.value;
    const role = request.cookies.get("role")?.value;

    if (!token || role !== "admin") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

