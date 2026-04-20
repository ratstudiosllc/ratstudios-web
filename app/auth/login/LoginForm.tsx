"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";
  const error = searchParams.get("error");

  return (
    <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-orange-600">RaT Ops Admin</p>
      <h1 className="mt-3 text-3xl font-bold text-neutral-950">Sign in</h1>
      <p className="mt-2 text-sm text-neutral-500">Use your approved admin email and password.</p>

      <form action="/auth/login/submit" method="post" className="mt-6 space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
          <input
            type="email"
            required
            name="email"
            autoComplete="email"
            className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black/30"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Password</label>
          <input
            type="password"
            required
            name="password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black/30"
          />
        </div>
        <button type="submit" className="btn-gradient w-full px-6 py-3 text-sm">
          Sign in
        </button>
      </form>

      {error === "invalid_credentials" ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Invalid email or password.</p> : null}

      <div className="mt-4">
        <p className="text-xs text-neutral-500">
          Need the main site? <Link href="/" className="underline underline-offset-2">Go back home</Link>
        </p>
      </div>
    </div>
  );
}
