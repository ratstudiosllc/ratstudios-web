import Link from "next/link";
import { IdeaCreateForm } from "@/components/admin/IdeaCreateForm";

export default function NewIdeaPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Ideas</p>
              <h1 className="mt-2 text-3xl font-semibold text-neutral-950">Create new idea intake</h1>
              <p className="mt-4 max-w-3xl text-sm text-neutral-600">This is the front door for the opportunity research agent workflow. Start with the idea brief, then score and validate it before promoting it into the future apps pipeline.</p>
            </div>
            <Link href="/admin/ideas" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">Back to ideas</Link>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <IdeaCreateForm />
        </div>
      </div>
    </div>
  );
}
