import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirect = params.redirect && params.redirect.startsWith("/") ? params.redirect : "/admin";
  const error = params.error === "1";

  return (
    <div className="min-h-screen bg-[#faf7f2] px-6 py-16 text-neutral-900">
      <div className="mx-auto max-w-md rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">RaT Studios admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-neutral-950">Sign in</h1>
        <p className="mt-3 text-sm text-neutral-600">Use the admin gate credentials for the Rat Studios dashboard.</p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Wrong username or password.
          </div>
        ) : null}

        <form action="/auth/login/submit" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="redirect" value={redirect} />

          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-neutral-700">Username</label>
            <input id="username" name="username" type="text" autoComplete="username" required className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-orange-300" />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-neutral-700">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-orange-300" />
          </div>

          <button type="submit" className="w-full rounded-2xl gradient-bg px-4 py-3 font-semibold text-white transition hover:opacity-90">
            Enter admin
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/" className="hover:text-orange-500">Back to site</Link>
        </div>
      </div>
    </div>
  );
}
