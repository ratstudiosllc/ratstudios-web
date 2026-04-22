import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const raw = fs.readFileSync(new URL("../data/ideas-store.json", import.meta.url), "utf8");
const parsed = JSON.parse(raw);
const ideas = Array.isArray(parsed.ideas) ? parsed.ideas : [];

const supabase = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rows = ideas.map((idea) => ({
  slug: idea.slug,
  idea_name: idea.ideaName,
  industry: idea.industry,
  one_sentence_concept: idea.oneSentenceConcept,
  problem_solved: idea.problemSolved,
  target_user: idea.targetUser,
  product_type: idea.productType,
  buyer: idea.buyer ?? null,
  business_model_guess: idea.businessModelGuess ?? null,
  geography: idea.geography ?? null,
  why_now: idea.whyNow ?? null,
  workflow_state: String(idea.workflowState || "new_idea").toLowerCase().replace(/\s+/g, "_"),
  recommendation: String(idea.recommendation || "revisit_later").toLowerCase().replace(/\s+/g, "_").replace("pursue", "pursue_now").replace("hold", "revisit_later").replace("pass", "do_not_pursue"),
  confidence: String(idea.confidence || "low").toLowerCase(),
  best_wedge: idea.bestWedge || "",
  strongest_reason_to_build: idea.strongestReasonToBuild || "",
  strongest_reason_not_to_build: idea.strongestReasonNotToBuild || "",
  biggest_risk: idea.biggestRisk || "",
  next_validation_steps: idea.nextValidationSteps || [],
  memo_summary: idea.memoSummary || "",
  memo_sections: idea.memoSections || [],
  evidence_sources: idea.evidenceSources || [],
  research_inputs: idea.researchInputs || [],
  scorecard_json: idea.scorecard || {},
  disposition: String(idea.disposition || "active").toLowerCase(),
  promoted_app_slug: idea.promotedAppSlug ?? null,
  created_at: idea.createdAt,
  updated_at: idea.updatedAt,
}));

const { data, error } = await supabase
  .from("admin_opportunity_ideas")
  .upsert(rows, { onConflict: "slug" })
  .select("id");

if (error) throw error;

console.log(JSON.stringify({ imported: data?.length || 0 }, null, 2));
