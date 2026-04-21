import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-gate";

export function getAdminGateConfig() {
  return {
    gateUser: process.env.ADMIN_GATE_USER ?? "admin",
    gatePassword: process.env.ADMIN_GATE_PASSWORD ?? "",
    allowedEmails: (process.env.ADMIN_ALLOWED_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean),
  };
}

export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export function isAllowedAdminUser(username: string) {
  const normalized = username.trim().toLowerCase();
  const { gateUser, allowedEmails } = getAdminGateConfig();
  const fallbackEmails = ["admin@ratstudios.ai"];
  return (
    timingSafeEqual(normalized, gateUser.trim().toLowerCase()) ||
    allowedEmails.some((email) => timingSafeEqual(normalized, email)) ||
    fallbackEmails.some((email) => timingSafeEqual(normalized, email))
  );
}

export function isValidAdminLogin(username: string, password: string) {
  const { gatePassword } = getAdminGateConfig();
  return isAllowedAdminUser(username) && timingSafeEqual(password, gatePassword);
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === "1";
}
