"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";

import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Admin password
        </label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
          <input
            autoComplete="current-password"
            autoFocus
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
            id="password"
            name="password"
            placeholder="Enter your password"
            required
            type="password"
          />
        </div>
        {state.error ? (
          <p aria-live="polite" className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>

      <button
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-950/20 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <>
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <ArrowRight aria-hidden="true" className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
