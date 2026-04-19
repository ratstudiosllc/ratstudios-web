"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

function priorityClasses(priority: string) {
  if (priority === "P1") return "bg-red-100 text-red-800 border-red-200";
  if (priority === "P2") return "bg-amber-100 text-amber-800 border-amber-200";
  if (priority === "P3") return "bg-sky-100 text-sky-800 border-sky-200";
  return "bg-neutral-100 text-neutral-700 border-neutral-200";
}

export function IssuePrioritySelect({ issueId, priority }: { issueId: string; priority: string }) {
  const router = useRouter();
  const [value, setValue] = useState(priority);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function updatePriority(nextPriority: string) {
    setValue(nextPriority);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, priority: nextPriority }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to update priority");
        setValue(priority);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">Priority</label>
        <select
          value={value}
          onChange={(event) => updatePriority(event.target.value)}
          disabled={isPending}
          className={`rounded-xl border px-3 py-2 text-sm font-medium ${priorityClasses(value)}`}
        >
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
