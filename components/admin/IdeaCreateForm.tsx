"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function IdeaCreateForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    ideaName: "",
    oneSentenceConcept: "",
    problemSolved: "",
    targetUser: "",
    productType: "",
    buyer: "",
    businessModelGuess: "",
    geography: "United States",
    whyNow: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/admin/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await response.json();
    if (!response.ok) {
      setSubmitting(false);
      setError(json.error || "Failed to create idea");
      return;
    }

    router.push(`/admin/ideas/${json.idea.slug}`);
    router.refresh();
  }

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-neutral-900">Idea name</span>
          <input value={form.ideaName} onChange={(e) => updateField("ideaName", e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-900">Product type</span>
          <input value={form.productType} onChange={(e) => updateField("productType", e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-neutral-900">One-sentence concept</span>
        <textarea value={form.oneSentenceConcept} onChange={(e) => updateField("oneSentenceConcept", e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-black/10 px-4 py-3" />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-neutral-900">Problem solved</span>
        <textarea value={form.problemSolved} onChange={(e) => updateField("problemSolved", e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-black/10 px-4 py-3" />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-neutral-900">Target user</span>
        <textarea value={form.targetUser} onChange={(e) => updateField("targetUser", e.target.value)} className="mt-2 min-h-20 w-full rounded-2xl border border-black/10 px-4 py-3" />
      </label>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <label className="block text-sm">
          <span className="font-medium text-neutral-900">Buyer</span>
          <input value={form.buyer} onChange={(e) => updateField("buyer", e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-900">Business model guess</span>
          <input value={form.businessModelGuess} onChange={(e) => updateField("businessModelGuess", e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-900">Geography</span>
          <input value={form.geography} onChange={(e) => updateField("geography", e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-900">Why now</span>
          <input value={form.whyNow} onChange={(e) => updateField("whyNow", e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" />
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button disabled={submitting} className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60">
        {submitting ? "Creating idea…" : "Create idea intake"}
      </button>
    </form>
  );
}
