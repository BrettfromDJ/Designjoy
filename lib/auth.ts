import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "dj_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// The session cookie holds an HMAC of the admin password, so changing
// ADMIN_PASSWORD signs everyone out.
function sessionToken(password: string) {
  return createHmac("sha256", password).update("designjoy-admin-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? safeEqual(token, sessionToken(password)) : false;
}

export async function signIn(attempt: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !safeEqual(attempt, password)) return false;
  (await cookies()).set(COOKIE, sessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
