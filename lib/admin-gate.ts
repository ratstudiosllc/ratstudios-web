export const ADMIN_SESSION_COOKIE = "rat_admin_session";

export function getAdminGateUser() {
  return (process.env.ADMIN_GATE_USER || "").trim().toLowerCase();
}

export function getAdminGatePassword() {
  return process.env.ADMIN_GATE_PASSWORD || "";
}

export function isValidAdminGateCredentials(email: string, password: string) {
  const expectedUser = getAdminGateUser();
  const expectedPassword = getAdminGatePassword();

  if (!expectedUser || !expectedPassword) return false;
  return email.trim().toLowerCase() === expectedUser && password === expectedPassword;
}
