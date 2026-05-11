"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminRecommendation, RecommendationAction } from "@/lib/recommendations";

const actions: Array<{ action: RecommendationAction; label: string; tone: string; help: string }> = [
  { action: "approve", label: "Approve + queue", tone: "bg-sky-600 text-white hover:bg-sky-700", help: "Approve and immediately create a tracked implementation issue." },
  { action: "reject", label: "Reject", tone: "bg-red-600 text-white hover:bg-red-700", help: "Deny and keep the decision audit." },
  { action: "defer", label: "Defer", tone: "bg-neutral-200 text-neutral-800 hover:bg-neutral-300", help: "Keep it visible, but not active." },
  { action: "mark_implemented", label: "Mark implemented", tone: "bg-emerald-600 text-white hover:bg-emerald-700", help: "Record that work is already done." },
  { action: "convert_to_issue", label: "Convert to issue", tone: "bg-neutral-950 text-white hover:bg-neutral-800", help: "Create or record a tracked action item." },
];

export function RecommendationActionPanel({ recommendation }: { recommendation: AdminRecommendation }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<RecommendationAction | null>(null);
  const [isPending, startTransition] = useTransition();

  const lastDecision = useMemo(() => {
    if (!recommendation.decisionAt) return null;
    const date = new Date(recommendation.decisionAt);
    const formatted = Number.isNaN(date.getTime()) ? recommendation.decisionAt : date.toLocaleString("en-US", { timeZone: "America/Denver", dateStyle: "medium", timeStyle: "short" });
    return `${formatted}${recommendation.decisionBy ? ` by ${recommendation.decisionBy}` : ""}`;
  }, [recommendation.decisionAt, recommendation.decisionBy]);

  function submit(action: RecommendationAction) {
    setActiveAction(action);
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/recommendations/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recommendationId: recommendation.id,
            action,
            notes,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(typeof payload.error === "string" ? payload.error : "Recommendation action failed");
        }
        setNotes("");
        setMessage(action === "approve" ? "Approved and queued for implementation." : "Decision saved.");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Recommendation action failed");
      } finally {
        setActiveAction(null);
      }
    });
  }

  return (
    <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Operator decision</p>
          <p className="mt-1 text-sm text-neutral-600">Approve creates a tracked implementation issue for Bub/agents right away. Reject and defer only save the decision audit.</p>
          {lastDecision ? <p className="mt-2 text-xs text-neutral-500">Last decision: {lastDecision}</p> : null}
          {recommendation.convertedIssueId ? <p className="mt-1 text-xs font-medium text-neutral-700">Action item: {recommendation.convertedIssueId}</p> : null}
        </div>
        <div className="w-full lg:max-w-md">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500" htmlFor={`notes-${recommendation.id}`}>Optional notes</label>
          <textarea
            id={`notes-${recommendation.id}`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fcfaf7] px-3 py-2 text-sm text-neutral-800 outline-none focus:border-orange-300 focus:bg-white"
            placeholder="Decision context, implementation hint, or why this is deferred/rejected…"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {actions.map((item) => (
          <button
            key={item.action}
            type="button"
            disabled={isPending}
            onClick={() => submit(item.action)}
            title={item.help}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${item.tone}`}
          >
            {isPending && activeAction === item.action ? "Saving…" : item.label}
          </button>
        ))}
      </div>
      {message ? <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
