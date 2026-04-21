import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(new URL("/admin", "https://www.ratstudios.ai"));
  response.cookies.set("rat_admin_direct", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
