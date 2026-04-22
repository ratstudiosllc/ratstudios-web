import { promoteOpportunityIdea } from "@/lib/admin-opportunities";

export async function promoteIdeaToFutureApps(id: string) {
  return promoteOpportunityIdea(id);
}
