import { NextResponse } from "next/server";
import { getDomainRegistrationDashboard } from "@/lib/cloudflare-registrar";

export async function GET() {
  return NextResponse.json(await getDomainRegistrationDashboard());
}
