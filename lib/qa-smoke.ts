import fs from "node:fs";
import path from "node:path";

export interface SmokeRouteCheck {
  path: string;
  label: string;
  expectedText?: string[];
}

export interface SmokeRouteResult {
  path: string;
  label: string;
  ok: boolean;
  status: number;
  durationMs: number;
  matchedTexts: string[];
  missingTexts: string[];
  error?: string;
}

export interface SmokeRunResult {
  generatedAt: string;
  baseUrl: string;
  ok: boolean;
  summary: {
    passed: number;
    failed: number;
    total: number;
  };
  routes: SmokeRouteResult[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const QA_RESULTS_PATH = path.join(DATA_DIR, "qa-smoke-results.json");

export const criticalAdminRoutes: SmokeRouteCheck[] = [
  { path: "/admin", label: "Admin dashboard", expectedText: ["RaT Studios admin"] },
  { path: "/admin/issues", label: "Issues", expectedText: ["Tracked issues"] },
  { path: "/admin/ideas", label: "Ideas queue", expectedText: ["Opportunity research queue"] },
  { path: "/admin/ideas/self-storage-management-software", label: "Self-storage idea", expectedText: ["Self-storage management software"] },
];

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readLatestSmokeResult(): SmokeRunResult | null {
  try {
    return JSON.parse(fs.readFileSync(QA_RESULTS_PATH, "utf8")) as SmokeRunResult;
  } catch {
    return null;
  }
}

export function writeSmokeResult(result: SmokeRunResult) {
  ensureDataDir();
  fs.writeFileSync(QA_RESULTS_PATH, JSON.stringify(result, null, 2) + "\n");
}

export async function runSmokeChecks(baseUrl: string, routes: SmokeRouteCheck[] = criticalAdminRoutes): Promise<SmokeRunResult> {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const results: SmokeRouteResult[] = [];
  let cookieHeader = "";

  try {
    const loginResponse = await fetch(`${normalizedBaseUrl}/admin/login-direct`, {
      redirect: "manual",
      headers: {
        "user-agent": "ratstudios-qa-smoke/1.0",
        accept: "text/html,application/xhtml+xml",
      },
    });
    const setCookie = loginResponse.headers.get("set-cookie") ?? "";
    cookieHeader = setCookie
      .split(/,(?=\s*[^;]+=)/)
      .map((part) => part.split(";")[0].trim())
      .filter(Boolean)
      .join("; ");
  } catch {
    cookieHeader = "";
  }

  for (const route of routes) {
    const started = Date.now();
    try {
      const response = await fetch(`${normalizedBaseUrl}${route.path}`, {
        redirect: "follow",
        headers: {
          "user-agent": "ratstudios-qa-smoke/1.0",
          accept: "text/html,application/xhtml+xml",
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
      });
      const text = await response.text();
      const matchedTexts = (route.expectedText ?? []).filter((snippet) => text.includes(snippet));
      const missingTexts = (route.expectedText ?? []).filter((snippet) => !text.includes(snippet));
      results.push({
        path: route.path,
        label: route.label,
        ok: response.ok && missingTexts.length === 0,
        status: response.status,
        durationMs: Date.now() - started,
        matchedTexts,
        missingTexts,
      });
    } catch (error) {
      results.push({
        path: route.path,
        label: route.label,
        ok: false,
        status: 0,
        durationMs: Date.now() - started,
        matchedTexts: [],
        missingTexts: route.expectedText ?? [],
        error: error instanceof Error ? error.message : "Unknown smoke-check error",
      });
    }
  }

  const summary = {
    passed: results.filter((route) => route.ok).length,
    failed: results.filter((route) => !route.ok).length,
    total: results.length,
  };

  const runResult: SmokeRunResult = {
    generatedAt: new Date().toISOString(),
    baseUrl: normalizedBaseUrl,
    ok: summary.failed === 0,
    summary,
    routes: results,
  };

  writeSmokeResult(runResult);
  return runResult;
}
