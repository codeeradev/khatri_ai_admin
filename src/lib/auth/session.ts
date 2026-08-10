import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from "@/lib/auth/token";

export async function createAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    priority: "high",
  });
}

export async function deleteAdminSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/login");
}
