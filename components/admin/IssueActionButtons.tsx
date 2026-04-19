"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ActionName = "claim" | "start" | "block" | "ready_for_verification" | "resolve";

const buttonStyles: Record<ActionName, string> = {
  claim: "border-neutral-200 text-neutral-700 hover:bg-neutral-50",
  start: "border-violet-200 text-violet-700 hover:bg-violet-50",
  block: "border-red-200 text-red-700 hover:bg-red-50",
  ready_for_verification: "border-fuchsia-200 text-fuchsia-700 hover:bg-fuchsia-50",
  resolve: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
};

const labels: Record<ActionName, string> = {
  claim: "Claim",
  start: "Start",
  block: "Block",
  ready_for_verification: "Needs verification",
  resolve: "Resolve",
};

export function IssueActionButtons({
  issueId,
  status,
  ownerAgent,
  committed,
  pushed,
  deployed,
}: {
  issueId: string;
  status: string;
  ownerAgent?: string;
  committed: string;
  pushed: string;
  deployed: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function runAction(action: ActionName) {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/issues/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, action }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Action failed");
        return;
      }

      router.refresh();
    });
  }

  const canClaim = !ownerAgent || ownerAgent === "unassigned" || status === "New" || status === "Triaged" || status === "Unresolved";
  const canStart = status === "New" || status === "Triaged" || status === "Unresolved" || status === "Blocked";
  const canBlock = status === "In Progress" || status === "Ready for QA";
  const canMoveToVerification = status === "In Progress" || status === "Ready for QA";
  const canResolve = status === "Needs Verification" && committed === "Yes" && pushed === "Yes" && deployed === "Yes";

  const actions: ActionName[] = [];
  if (canClaim) actions.push("claim");
  if (canStart) actions.push("start");
  if (canBlock) actions.push("block");
  if (canMoveToVerification) actions.push("ready_for_verification");
  if (canResolve) actions.push("resolve");

  if (!actions.length) return null;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            disabled={isPending}
            onClick={() => runAction(action)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${buttonStyles[action]} disabled:opacity-50`}
          >
            {labels[action]}
          </button>
        ))}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
