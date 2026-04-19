import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminGateConfig, isAllowedAdminUser, timingSafeEqual } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const user = String(formData.get("admin_user") ?? "").trim().toLowerCase();
  const password = String(formData.get("admin_password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const { gatePassword } = getAdminGateConfig();

  if (!password || !gatePassword || !isAllowedAdminUser(user) || !timingSafeEqual(password, gatePassword)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), { status: 303 });
  }

  const destination = new URL(next.startsWith("/") ? next : "/admin", request.url);
  const response = NextResponse.redirect(destination, { status: 303 });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
