import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getCurrentApps } from "@/lib/studio-admin";
import { CurrentAppsChecklistClient } from "./CurrentAppsChecklistClient";

export const dynamic = "force-dynamic";

export default function CurrentAppsChecklistTestPage() {
  const apps = getCurrentApps().map((app) => ({
    slug: app.slug,
    name: app.name,
    type: app.type,
    summary: app.summary,
  }));

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-[1500px] px-6 py-10">
        <AdminPageHeader title="Current Apps Checklist Prototype" active="current-apps" eyebrow="RaT Studios Admin Sandbox" />
        <CurrentAppsChecklistClient apps={apps} />
      </div>
    </div>
  );
}
