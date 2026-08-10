"use server";

import { redirect } from "next/navigation";

import { createAdminSession, deleteAdminSession } from "@/lib/auth/session";
import { verifyAdminPassword } from "@/lib/auth/token";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || !password) {
    return { error: "Enter the admin password." };
  }

  try {
    if (!verifyAdminPassword(password)) {
      return { error: "The password you entered is incorrect." };
    }

    await createAdminSession();
  } catch (error) {
    console.error("Admin login configuration error:", error);
    return { error: "Admin access is not configured correctly." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteAdminSession();
  redirect("/login");
}
