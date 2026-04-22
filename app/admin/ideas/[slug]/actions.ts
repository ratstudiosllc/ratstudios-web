"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { archiveIdea } from "@/lib/ideas-agent";
import { promoteIdeaToFutureApps } from "@/lib/idea-promotion";

export async function archiveIdeaAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const key = id || slug;

  try {
    if (key) {
      await archiveIdea(key);
    }
  } catch {
    redirect("/admin/ideas?error=archive_failed");
  }

  redirect("/admin/ideas?archived=1");
}

export async function promoteIdeaAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const key = id || slug;

  try {
    if (!key) {
      throw new Error("Idea id is required");
    }

    const result = await promoteIdeaToFutureApps(key);
    redirect(`/admin/future-apps/${result.futureApp.slug}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "promote_failed";
    redirect(`/admin/ideas?error=${encodeURIComponent(message)}`);
  }
}
