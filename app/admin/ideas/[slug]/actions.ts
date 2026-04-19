"use server";

import { redirect } from "next/navigation";
import { archiveIdea, getIdeaById, promoteIdea } from "@/lib/ideas-agent";
import { createFutureAppFromIdea } from "@/lib/future-apps-agent";

export async function archiveIdeaAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  try {
    if (id) {
      archiveIdea(id);
    }
  } catch {
    redirect("/admin/ideas?error=archive_failed");
  }

  redirect("/admin/ideas?archived=1");
}

export async function promoteIdeaAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  try {
    const promoted = id ? promoteIdea(id) : null;
    const idea = promoted ?? (id ? getIdeaById(id) : null);

    if (idea) {
      createFutureAppFromIdea({
        slug: idea.slug,
        name: idea.ideaName,
        summary: idea.memoSummary,
        problemStatement: idea.problemSolved,
        targetUsers: [idea.targetUser],
        priorResearchNotes: [
          idea.oneSentenceConcept,
          idea.bestWedge,
          idea.strongestReasonToBuild,
          idea.strongestReasonNotToBuild,
        ].filter(Boolean),
        bucket: idea.industry,
        owner: "Bub",
      });
    }
  } catch {
    redirect("/admin/ideas?error=promote_failed");
  }

  redirect("/admin/future-apps?promoted=1");
}
