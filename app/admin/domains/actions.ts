"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { syncCloudflareRegistrarRegistrations } from "@/lib/cloudflare-registrar";

export async function syncRegistrarDomainsAction() {
  try {
    await syncCloudflareRegistrarRegistrations();
    revalidatePath("/admin/domains");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    redirect(`/admin/domains?sync=error&message=${encodeURIComponent(message)}`);
  }

  redirect("/admin/domains?sync=success");
}
