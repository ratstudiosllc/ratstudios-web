import { readFileSync } from "node:fs";
import path from "node:path";

export type RecommendationCategory = "self-improvement" | "architecture" | "UI/UX" | "security" | "ops" | "growth" | "product" | "other";
export type RecommendationSeverity = "low" | "medium" | "high" | "critical";
export type RecommendationPriority = "P1" | "P2" | "P3" | "P4";
export type RecommendationEffort = "small" | "medium" | "large";
export type RecommendationImpact = "low" | "medium" | "high";
export type RecommendationStatus = "recommended" | "approved" | "rejected" | "deferred" | "implemented";

export interface RecommendationEvidenceLink {
  label: string;
  href: string;
}

export interface AdminRecommendation {
  id: string;
  slug: string;
  title: string;
  appProduct: string;
  category: RecommendationCategory;
  severity: RecommendationSeverity;
  priority: RecommendationPriority;
  effort: RecommendationEffort;
  impact: RecommendationImpact;
  rationale: string;
  riskIfIgnored: string;
  evidenceLinks: RecommendationEvidenceLink[];
  status: RecommendationStatus;
  approvalNotes?: string;
  implementationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface RecommendationsStoreData {
  recommendations: AdminRecommendation[];
}

const storePath = path.join(process.cwd(), "data", "recommendations-store.json");

function readRecommendationsStore(): RecommendationsStoreData {
  const raw = readFileSync(storePath, "utf8");
  return JSON.parse(raw) as RecommendationsStoreData;
}

export function listRecommendations() {
  return readRecommendationsStore().recommendations.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function getRecommendationsSummary(recommendations = listRecommendations()) {
  return {
    total: recommendations.length,
    recommended: recommendations.filter((item) => item.status === "recommended").length,
    approved: recommendations.filter((item) => item.status === "approved").length,
    deferred: recommendations.filter((item) => item.status === "deferred").length,
    implemented: recommendations.filter((item) => item.status === "implemented").length,
    highImpact: recommendations.filter((item) => item.impact === "high").length,
  };
}

export function getRecommendationFilterOptions(recommendations = listRecommendations()) {
  return {
    appProducts: Array.from(new Set(recommendations.map((item) => item.appProduct))).sort((a, b) => a.localeCompare(b)),
    categories: Array.from(new Set(recommendations.map((item) => item.category))).sort((a, b) => a.localeCompare(b)),
    priorities: Array.from(new Set(recommendations.map((item) => item.priority))).sort((a, b) => a.localeCompare(b)),
    statuses: Array.from(new Set(recommendations.map((item) => item.status))).sort((a, b) => a.localeCompare(b)),
  };
}
