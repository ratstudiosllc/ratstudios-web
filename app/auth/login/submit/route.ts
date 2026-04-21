import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, isValidAdminLogin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const redirect = String(formData.get("redirect") || "/admin");
  const safeRedirect = redirect.startsWith("/") ? redirect : "/admin";

  if (!isValidAdminLogin(username, password)) {
    return NextResponse.redirect(new URL(`/auth/login?redirect=${encodeURIComponent(safeRedirect)}&error=1`, req.url));
  }

  await createAdminSession();
  return NextResponse.redirect(new URL(safeRedirect, req.url));
}
