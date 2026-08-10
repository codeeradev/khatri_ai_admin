import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/auth/session";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  if (await isAdminAuthenticated()) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f6f1] px-5 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.1),transparent_36%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-7 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
          <Sparkles aria-hidden="true" className="size-6" />
        </div>
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Khatri AI
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Admin sign in
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Enter the administrator password to manage the assistant.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
