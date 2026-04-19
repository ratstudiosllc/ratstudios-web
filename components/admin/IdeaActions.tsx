"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function IdeaActions({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"archive" | "promote" | null>(null);

  async function runAction(action: "archive" | "promote") {
    setLoading(action);
    await fetch(`/api/admin/ideas/${ideaId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button onClick={() => runAction("promote")} disabled={loading !== null} className="rounded-2xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60">
        {loading === "promote" ? "Promoting…" : "Promote to future pipeline"}
      </button>
      <button onClick={() => runAction("archive")} disabled={loading !== null} className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03] disabled:opacity-60">
        {loading === "archive" ? "Archiving…" : "Archive idea"}
      </button>
    </div>
  );
}
