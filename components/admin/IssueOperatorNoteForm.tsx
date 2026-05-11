"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function IssueOperatorNoteForm({ issueId }: { issueId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    const trimmed = note.trim();
    if (!trimmed) {
      setError("Add a note or prompt first.");
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, operatorNote: trimmed }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Could not save operator note");
        return;
      }

      setNote("");
      setMessage("Instruction added to issue.");
      router.refresh();
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-black/10 bg-[#fcfaf7] p-4">
      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500" htmlFor={`operator-note-${issueId}`}>
        Add details for Bub / agent
      </label>
      <textarea
        id={`operator-note-${issueId}`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-orange-300"
        placeholder="Extra context, constraints, acceptance criteria, or prompt for the agent…"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Adding…" : "Add instruction"}
        </button>
        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
