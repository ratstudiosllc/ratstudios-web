import { NextResponse } from "next/server";
import { getOpsRunDetail } from "@/lib/ops-admin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const detail = await getOpsRunDetail(id);

  if (!detail) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}
