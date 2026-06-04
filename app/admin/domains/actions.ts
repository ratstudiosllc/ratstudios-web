"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { syncCloudflareRegistrarRegistrations } from "@/lib/cloudflare-registrar";

export async function syncRegistrarDomainsAction() {
  try {
    await syncCloudflareRegistrarRegistrations();
    revalidatePath("/admin/domains");
    redirect("/admin/domains?sync=success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    redirect(`/admin/domains?sync=error&message=${encodeURIComponent(message)}`);
  }
}
