import { NextRequest, NextResponse } from "next/server";
import {
  getOpsRuns,
  type OpsFilters,
  type RunStatus,
  type TriggerType,
} from "@/lib/ops-admin";

function parseList(value: string | null) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const filters: OpsFilters = {
    search: searchParams.get("search") ?? undefined,
    status: parseList(searchParams.get("status")) as RunStatus[],
    project: parseList(searchParams.get("project")),
    environment: parseList(searchParams.get("environment")),
    trigger_type: parseList(searchParams.get("trigger_type")) as TriggerType[],
    owner: parseList(searchParams.get("owner")),
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
    sortBy: (searchParams.get("sortBy") as OpsFilters["sortBy"]) ?? undefined,
    sortDir: (searchParams.get("sortDir") as OpsFilters["sortDir"]) ?? undefined,
  };

  return NextResponse.json(await getOpsRuns(filters));
}
