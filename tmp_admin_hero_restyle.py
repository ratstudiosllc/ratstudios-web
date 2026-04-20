from pathlib import Path
replacements = {
'app/admin/current-apps/page.tsx': (
'''        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-orange-500">Current App Portfolio</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Dashboard</Link>
            <Link href="/admin/issues" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Issues</Link>
            <Link href="/admin/marketing" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Marketing</Link>
          </div>
        </div>''',
'''        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>Current App Portfolio</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>Live products, issue pressure, and the next moves that actually matter.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/issues" className="btn-gradient px-6 py-3 text-sm">Tracked Issues</Link>
              <Link href="/admin/marketing" className="btn-gradient px-6 py-3 text-sm">Marketing</Link>
            </div>
          </div>
        </div>'''),
'app/admin/future-apps/page.tsx': (
'''        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-orange-500">Future App Pipeline</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Dashboard</Link>
            <Link href="/admin/ideas" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Ideas</Link>
          </div>
        </div>''',
'''        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>Future App Pipeline</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>Ideas that survived early screening and now need real commercial judgment.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/ideas" className="btn-gradient px-6 py-3 text-sm">Ideas Queue</Link>
            </div>
          </div>
        </div>'''),
'app/admin/issues/page.tsx': (
'''        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-orange-500">Tracked Issues</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Dashboard</Link>
            <Link href="/admin/current-apps" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Current Apps</Link>
          </div>
        </div>''',
'''        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>Tracked Issues</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>Production problems, ownership, and what is blocked right now.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/current-apps" className="btn-gradient px-6 py-3 text-sm">Current Apps</Link>
            </div>
          </div>
        </div>'''),
'app/admin/ideas/page.tsx': (
'''        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-orange-500">{view === "archived" ? "Archived Ideas" : "Opportunity Research Queue"}</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            {view === "active" ? <Link href="/admin/ideas/new" className="rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800">New Idea</Link> : null}
            {view === "archived" ? <Link href="/admin/ideas" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Active Ideas</Link> : null}
            <Link href="/admin" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Dashboard</Link>
            <Link href="/admin/future-apps" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Future Apps</Link>
          </div>
        </div>''',
'''        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>{view === "archived" ? "Archived Ideas" : "Opportunity Research Queue"}</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>{view === "archived" ? "Past ideas kept for memory, reference, and pattern spotting." : "New concepts under active scoring, pressure testing, and founder review."}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {view === "active" ? <Link href="/admin/ideas/new" className="btn-gradient px-6 py-3 text-sm">New Idea</Link> : null}
              {view === "archived" ? <Link href="/admin/ideas" className="btn-gradient px-6 py-3 text-sm">Active Ideas</Link> : null}
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/future-apps" className="btn-gradient px-6 py-3 text-sm">Future Apps</Link>
            </div>
          </div>
        </div>'''),
'app/admin/marketing/page.tsx': (
'''        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-orange-500">Marketing by Application</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Dashboard</Link>
            <Link href="/admin/current-apps" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Current Apps</Link>
          </div>
        </div>''',
'''        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>Marketing by Application</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>Positioning, channel work, and growth priorities for the products already in motion.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/current-apps" className="btn-gradient px-6 py-3 text-sm">Current Apps</Link>
            </div>
          </div>
        </div>'''),
'app/admin/org-chart/page.tsx': (
'''        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-orange-500">RaT Studios Leadership and Agent Org</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Dashboard</Link>
            <Link href="/admin/agent-runs" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Agent Runs</Link>
          </div>
        </div>''',
'''        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>RaT Studios Leadership and Agent Org</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>Who owns what, how work flows, and where agent execution actually sits in the studio.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/agent-runs" className="btn-gradient px-6 py-3 text-sm">Agent Runs</Link>
            </div>
          </div>
        </div>'''),
'app/admin/agent-runs/page.tsx': (
'''        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-orange-500">Execution Activity</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Dashboard</Link>
            <Link href="/admin/org-chart" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Org Chart</Link>
          </div>
        </div>''',
'''        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>Execution Activity</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>Recent run history, agent throughput, and the queue that is actually moving.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/org-chart" className="btn-gradient px-6 py-3 text-sm">Org Chart</Link>
            </div>
          </div>
        </div>'''),
}
for path,(old,new) in replacements.items():
    p=Path(path)
    text=p.read_text()
    if old not in text:
        raise SystemExit(f'missing block in {path}')
    p.write_text(text.replace(old,new))
print('restyled', len(replacements), 'files')
