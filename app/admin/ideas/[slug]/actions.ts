"use server";

import { redirect } from "next/navigation";
import { archiveIdea } from "@/lib/ideas-agent";
import { promoteIdeaToFutureApps } from "@/lib/idea-promotion";

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
    if (!id) {
      throw new Error("Idea id is required");
    }

    const result = await promoteIdeaToFutureApps(id);
    redirect(`/admin/future-apps/${result.futureApp.slug}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "promote_failed";
    redirect(`/admin/ideas?error=${encodeURIComponent(message)}`);
  }
}
