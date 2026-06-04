import { NextResponse } from "next/server";
import { getDomainRegistrationDashboard, syncCloudflareRegistrarRegistrations } from "@/lib/cloudflare-registrar";

export async function POST() {
  try {
    return NextResponse.json(await syncCloudflareRegistrarRegistrations());
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Cloudflare registrar sync error",
      dashboard: await getDomainRegistrationDashboard(),
    }, { status: 500 });
  }
}
