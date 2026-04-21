import { NextResponse } from "next/server";
import { getRunNowPayload } from "@/lib/ops-admin";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return NextResponse.json(getRunNowPayload(id));
}
