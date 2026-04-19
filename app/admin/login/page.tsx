import Link from "next/link";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next || "/admin";
  const hasError = params.error === "1";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-cream)" }}>
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-orange-600">RaT Ops Admin</p>
        <h1 className="mt-3 text-3xl font-bold text-neutral-950">Sign in</h1>
        <p className="mt-2 text-sm text-neutral-500">Use the admin password and we’ll drop you into the dashboard. Username is optional unless explicitly required by the server config.</p>

        <form action="/admin/login/submit" method="POST" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Username (optional)</label>
            <input name="admin_user" autoComplete="username" className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black/30" placeholder="Leave blank unless told otherwise" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Password</label>
            <input name="admin_password" type="password" autoComplete="current-password" className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black/30" />
          </div>
          <button type="submit" className="btn-gradient w-full px-6 py-3 text-sm">Sign in</button>
        </form>

        {hasError ? (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">That login did not work. Double-check the username and password.</p>
        ) : null}

        <div className="mt-4">
          <p className="text-xs text-neutral-500">
            Need the main site? <Link href="/" className="underline underline-offset-2">Go back home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
