import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "rat_admin_gate";

export function getAdminGateConfig() {
  return {
    gatePassword: process.env.ADMIN_GATE_PASSWORD ?? "",
  };
}

export function isAllowedAdminUser(_: string) {
  return true;
}

export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === "1";
}
