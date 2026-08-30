"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { graphAffiliations, graphFunctionReviews } from "@/db/schema";
import {
  validateFunctionReview,
  type ReviewDecision,
} from "@/graph/apply-review";
import { recomputeAffiliation } from "@/graph/import-batch";
import { loadVocab } from "@/graph/vocab";

export type ReviewInput = {
  affiliationId: string;
  decision: ReviewDecision;
  functionSlug?: string | null;
  reviewer: string;
  rationale?: string | null;
};

function revalidateReview() {
  revalidatePath("/review");
  revalidatePath("/review/done");
  revalidatePath("/chart", "layout");
}

export async function reviewAffiliation(input: ReviewInput) {
  const reviewer = input.reviewer.trim();
  if (!reviewer) throw new Error("Reviewer name is required");

  const vocab = loadVocab();
  const review = {
    decision: input.decision,
    functionSlug:
      input.decision === "classify" ? (input.functionSlug?.trim() ?? null) : null,
  };
  const error = validateFunctionReview(review, vocab);
  if (error) throw new Error(error);

  const [aff] = await db()
    .select()
    .from(graphAffiliations)
    .where(eq(graphAffiliations.affiliationId, input.affiliationId));
  if (!aff) throw new Error(`Affiliation ${input.affiliationId} is not in the graph`);

  const rationale = input.rationale?.trim() || null;
  const row = {
    orgId: aff.orgId,
    personId: aff.personId,
    rawTitle: aff.rawTitle,
    decision: review.decision,
    functionSlug: review.functionSlug,
    reviewer,
    rationale,
    updatedAt: new Date(),
  };

  await db()
    .insert(graphFunctionReviews)
    .values({ affiliationId: aff.affiliationId, ...row })
    .onConflictDoUpdate({
      target: graphFunctionReviews.affiliationId,
      set: row,
    });
  await recomputeAffiliation(aff.affiliationId);

  revalidateReview();
}

export async function undoReview(affiliationId: string) {
  const id = affiliationId.trim();
  if (!id) throw new Error("affiliationId is required");
  await db()
    .delete(graphFunctionReviews)
    .where(eq(graphFunctionReviews.affiliationId, id));
  await recomputeAffiliation(id);
  revalidateReview();
}
