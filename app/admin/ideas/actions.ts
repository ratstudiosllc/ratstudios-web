"use server";

import { revalidatePath } from "next/cache";
import { setIdeaFavorite } from "@/lib/ideas-agent";

export async function toggleIdeaFavoriteAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const nextFavorite = String(formData.get("nextFavorite") ?? "") === "true";
  if (!id) {
    throw new Error("Idea id is required");
  }

  setIdeaFavorite(id, nextFavorite);
  revalidatePath("/admin/ideas");
}
