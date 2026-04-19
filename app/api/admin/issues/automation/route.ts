import { NextResponse } from "next/server";
import { runIssueQueueOnce } from "@/lib/issue-runner";

export async function POST() {
  try {
    const result = await runIssueQueueOnce();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Automation failed" },
      { status: 500 },
    );
  }
}
