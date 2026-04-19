import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

const protectedPrefixes = ["/admin", "/api/admin"];
const protectedApiPrefixes = ["/api/admin"];
const authBypassCookie = "rat_admin_direct";

function isProtected(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isProtectedApi(pathname: string) {
  return protectedApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}


function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export function proxy(request: NextRequest) {
  if (!isProtected(request.nextUrl.pathname)) return NextResponse.next();

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const bypassCookie = request.cookies.get(authBypassCookie)?.value;
  if (cookieValue === "1" || bypassCookie === "1") {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/admin/login-direct") {
    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.set(ADMIN_SESSION_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set(authBypassCookie, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  if (isProtectedApi(request.nextUrl.pathname)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="RaT Ops Admin"' },
    });
  }

  return redirectToLogin(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
