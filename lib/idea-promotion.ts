import { createFutureAppFromIdea, getFutureAppById } from "@/lib/future-apps-agent";
import { getIdeaById, promoteIdea, updateIdea } from "@/lib/ideas-agent";

export async function promoteIdeaToFutureApps(id: string) {
  const existingIdea = await getIdeaById(id);
  if (!existingIdea) {
    throw new Error("Idea not found");
  }

  const futureApp = createFutureAppFromIdea({
    slug: existingIdea.slug,
    name: existingIdea.ideaName,
    summary: existingIdea.memoSummary,
    problemStatement: existingIdea.problemSolved,
    targetUsers: [existingIdea.targetUser],
    priorResearchNotes: [
      existingIdea.oneSentenceConcept,
      existingIdea.bestWedge,
      existingIdea.strongestReasonToBuild,
      existingIdea.strongestReasonNotToBuild,
    ].filter(Boolean),
    bucket: existingIdea.industry,
    owner: "Bub",
  });

  const verifiedFutureApp = getFutureAppById(futureApp.slug);
  if (!verifiedFutureApp) {
    throw new Error("Future app creation could not be verified");
  }

  const promotedIdea = promoteIdea(id);
  if (!promotedIdea) {
    throw new Error("Idea promotion failed");
  }

  const linkedIdea = updateIdea(id, { promotedAppSlug: verifiedFutureApp.slug });
  if (!linkedIdea || linkedIdea.promotedAppSlug !== verifiedFutureApp.slug) {
    throw new Error("Idea promotion link could not be verified");
  }

  return {
    idea: linkedIdea,
    futureApp: verifiedFutureApp,
  };
}
