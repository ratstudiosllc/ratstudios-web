import { NextResponse } from "next/server";
import { createIdea, listIdeas } from "@/lib/ideas-agent";

function normalize(value: unknown) {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length ? text : undefined;
}

export async function GET() {
  return NextResponse.json({ ideas: await listIdeas() });
}

export async function POST(request: Request) {
  const body = await request.json();

  const ideaName = normalize(body.ideaName);
  const oneSentenceConcept = normalize(body.oneSentenceConcept);
  const problemSolved = normalize(body.problemSolved);
  const targetUser = normalize(body.targetUser);
  const productType = normalize(body.productType);

  if (!ideaName || !oneSentenceConcept || !problemSolved || !targetUser || !productType) {
    return NextResponse.json({ error: "ideaName, oneSentenceConcept, problemSolved, targetUser, and productType are required" }, { status: 400 });
  }

  const idea = await createIdea({
    ideaName,
    oneSentenceConcept,
    problemSolved,
    targetUser,
    productType,
    buyer: normalize(body.buyer),
    businessModelGuess: normalize(body.businessModelGuess),
    geography: normalize(body.geography),
    whyNow: normalize(body.whyNow),
  });

  return NextResponse.json({ idea, ideas: await listIdeas() });
}
