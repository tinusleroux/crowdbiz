import type { Interpretation } from "./interpret";
import { inChartFor } from "./interpret";
import type { Vocab } from "./vocab";

export const REVIEW_DECISIONS = [
  "classify",
  "ignore",
  "remain_unknown",
] as const;

export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export type FunctionReview = {
  decision: ReviewDecision;
  functionSlug: string | null;
};

export function isReviewDecision(value: string): value is ReviewDecision {
  return (REVIEW_DECISIONS as readonly string[]).includes(value);
}

export function classifySlugs(vocab: Vocab): string[] {
  return vocab.functions
    .map((fn) => fn.slug)
    .filter((slug) => slug !== "unknown");
}

export function validateFunctionReview(
  review: FunctionReview,
  vocab: Vocab,
): string | null {
  if (!isReviewDecision(review.decision)) {
    return `Unknown review decision "${review.decision}"`;
  }
  if (review.decision === "classify") {
    const slug = review.functionSlug?.trim() ?? "";
    if (!slug || slug === "unknown") {
      return "Classify requires an existing function slug";
    }
    if (!vocab.functions.some((fn) => fn.slug === slug)) {
      return `Unknown function slug "${slug}"`;
    }
  }
  return null;
}

export function applyFunctionReview(
  matched: Interpretation,
  review: FunctionReview | null | undefined,
  affiliationType: string,
  vocab: Vocab,
): Interpretation {
  if (!review) return matched;

  if (review.decision === "ignore") {
    return { ...matched, inChart: false };
  }

  if (review.decision === "remain_unknown") {
    return {
      function: "unknown",
      seniority: matched.seniority,
      inChart: inChartFor("unknown", affiliationType, vocab),
    };
  }

  const slug = review.functionSlug?.trim() ?? "";
  const error = validateFunctionReview(review, vocab);
  if (error || !slug) {
    return matched;
  }
  return {
    function: slug,
    seniority: matched.seniority,
    inChart: inChartFor(slug, affiliationType, vocab),
  };
}
