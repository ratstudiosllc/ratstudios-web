import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-gate";
import { isValidAdminLogin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const redirect = String(formData.get("redirect") || "/admin");
  const safeRedirect = redirect.startsWith("/") ? redirect : "/admin";

  if (!isValidAdminLogin(username, password)) {
    return NextResponse.redirect(new URL(`/auth/login?redirect=${encodeURIComponent(safeRedirect)}&error=1`, req.url));
  }

  const response = NextResponse.redirect(new URL(safeRedirect, req.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
