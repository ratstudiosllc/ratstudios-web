from pathlib import Path

p = Path('lib/studio-admin.ts')
text = p.read_text()
text = text.replace('''export interface StudioKpi {
  label: string;
  value: string;
  helper: string;
}
''', '''export interface StudioKpi {
  label: string;
  value: string;
  helper: string;
}

function sameMountainDay(value: string | undefined, target: Date) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const targetParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(target);

  const getKey = (items: Intl.DateTimeFormatPart[]) => `${items.find((p) => p.type === "year")?.value}-${items.find((p) => p.type === "month")?.value}-${items.find((p) => p.type === "day")?.value}`;
  return getKey(parts) == getKey(targetParts);
}

function buildTodayIssueFixKpi(tracker: IssueTrackerResponse | null): StudioKpi {
  const today = new Date();
  const issues = tracker?.issues ?? [];
  const identifiedToday = issues.filter((issue) => sameMountainDay(issue.identified, today)).length;
  const fixedToday = issues.filter((issue) => {
    const verifiedToday = sameMountainDay(issue.updatedAt, today);
    return verifiedToday && issue.status === "Resolved" && issue.committed === "Yes" && issue.pushed === "Yes" && issue.deployed === "Yes";
  }).length;

  return {
    label: "Issues fixed today",
    value: `${fixedToday}/${identifiedToday}`,
    helper: `${identifiedToday} identified, ${fixedToday} fixed, deployed, and verified`,
  };
}
''')
text = text.replace('''  return [
    {
      label: "Current apps",
      value: String(currentApps.length),
      helper: "Products in market or active development",
    },
    {
      label: "Ideas",
      value: String(ideasSummary.active),
      helper: "Research-stage concepts and scored opportunities",
    },
    {
      label: "Future apps",
      value: String(futureApps.length),
      helper: "Approved concepts and validation bets",
    },
    {
      label: "Open issues",
      value: String(unresolvedIssues),
      helper: "Across tracked current products",
    },
    {
      label: "Critical issues",
      value: String(p1Issues),
      helper: "P1 issues still unresolved",
    },
  ];
}''', '''  return [
    {
      label: "Current apps",
      value: String(currentApps.length),
      helper: "Products in market or active development",
    },
    {
      label: "Ideas",
      value: String(ideasSummary.active),
      helper: "Research-stage concepts and scored opportunities",
    },
    {
      label: "Future apps",
      value: String(futureApps.length),
      helper: "Approved concepts and validation bets",
    },
    {
      label: "Open issues",
      value: String(unresolvedIssues),
      helper: "Across tracked current products",
    },
    {
      label: "Critical issues",
      value: String(p1Issues),
      helper: "P1 issues still unresolved",
    },
    buildTodayIssueFixKpi(tracker),
  ];
}''')
p.write_text(text)

p2 = Path('app/admin/page.tsx')
text2 = p2.read_text()
text2 = text2.replace('''        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard label={studioKpis[0].label} value={studioKpis[0].value} helper={studioKpis[0].helper} icon={<Layers3 className="h-5 w-5" />} href="/admin/current-apps" updatedAt={ops?.generatedAt ?? null} />
          <KpiCard label={studioKpis[1].label} value={studioKpis[1].value} helper={studioKpis[1].helper} icon={<Sparkles className="h-5 w-5" />} href="/admin/ideas" updatedAt={ideasSummary.latestUpdatedAt ?? null} />
          <KpiCard label={studioKpis[2].label} value={studioKpis[2].value} helper={studioKpis[2].helper} icon={<Megaphone className="h-5 w-5" />} href="/admin/future-apps" updatedAt={ops?.generatedAt ?? null} />
          <KpiCard label={studioKpis[3].label} value={studioKpis[3].value} helper={studioKpis[3].helper} icon={<Wrench className="h-5 w-5" />} href="/admin/issues" updatedAt={issues?.lastUpdated ?? null} />
          <KpiCard label={studioKpis[4].label} value={studioKpis[4].value} helper={studioKpis[4].helper} icon={<AlertCircle className="h-5 w-5" />} href="/admin/issues?priority=P1" updatedAt={issues?.lastUpdated ?? null} />
          <KpiCard label="Org chart" value="Studio" helper="Leadership, Bub, and agent roles" icon={<Building2 className="h-5 w-5" />} href="/admin/org-chart" updatedAt={issues?.lastUpdated ?? null} />
        </section>''', '''        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <KpiCard label={studioKpis[0].label} value={studioKpis[0].value} helper={studioKpis[0].helper} icon={<Layers3 className="h-5 w-5" />} href="/admin/current-apps" updatedAt={ops?.generatedAt ?? null} />
          <KpiCard label={studioKpis[1].label} value={studioKpis[1].value} helper={studioKpis[1].helper} icon={<Sparkles className="h-5 w-5" />} href="/admin/ideas" updatedAt={ideasSummary.latestUpdatedAt ?? null} />
          <KpiCard label={studioKpis[2].label} value={studioKpis[2].value} helper={studioKpis[2].helper} icon={<Megaphone className="h-5 w-5" />} href="/admin/future-apps" updatedAt={ops?.generatedAt ?? null} />
          <KpiCard label={studioKpis[3].label} value={studioKpis[3].value} helper={studioKpis[3].helper} icon={<Wrench className="h-5 w-5" />} href="/admin/issues" updatedAt={issues?.lastUpdated ?? null} />
          <KpiCard label={studioKpis[4].label} value={studioKpis[4].value} helper={studioKpis[4].helper} icon={<AlertCircle className="h-5 w-5" />} href="/admin/issues?priority=P1" updatedAt={issues?.lastUpdated ?? null} />
          <KpiCard label={studioKpis[5].label} value={studioKpis[5].value} helper={studioKpis[5].helper} icon={<CheckCircle2 className="h-5 w-5" />} href="/admin/issues" updatedAt={issues?.lastUpdated ?? null} />
          <KpiCard label="Org chart" value="Studio" helper="Leadership, Bub, and agent roles" icon={<Building2 className="h-5 w-5" />} href="/admin/org-chart" updatedAt={issues?.lastUpdated ?? null} />
        </section>''')
p2.write_text(text2)

print('today issue KPI added')
