"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { syncCloudflareRegistrarRegistrations } from "@/lib/cloudflare-registrar";

function formatSyncError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const parts = [record.message, record.details, record.hint, record.code]
      .filter((value): value is string => typeof value === "string" && value.length > 0);
    if (parts.length) return parts.join(" | ");

    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  return "Unknown sync error";
}

export async function syncRegistrarDomainsAction() {
  try {
    await syncCloudflareRegistrarRegistrations();
    revalidatePath("/admin/domains");
  } catch (error) {
    const message = formatSyncError(error);
    redirect(`/admin/domains?sync=error&message=${encodeURIComponent(message)}`);
  }

  redirect("/admin/domains?sync=success");
}
