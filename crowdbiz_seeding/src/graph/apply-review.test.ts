import { describe, expect, it } from "vitest";
import {
  applyFunctionReview,
  classifySlugs,
  validateFunctionReview,
} from "./apply-review";
import { interpretTitle } from "./interpret";
import { loadVocab } from "./vocab";

const vocab = loadVocab();

describe("validateFunctionReview", () => {
  it("rejects classify without a slug", () => {
    expect(
      validateFunctionReview({ decision: "classify", functionSlug: null }, vocab),
    ).toMatch(/existing function slug/);
  });

  it("rejects classify as unknown", () => {
    expect(
      validateFunctionReview(
        { decision: "classify", functionSlug: "unknown" },
        vocab,
      ),
    ).toMatch(/existing function slug/);
  });

  it("rejects an invented slug", () => {
    expect(
      validateFunctionReview(
        { decision: "classify", functionSlug: "not_a_function" },
        vocab,
      ),
    ).toMatch(/Unknown function slug/);
  });

  it("accepts classify to an authored slug", () => {
    expect(
      validateFunctionReview(
        { decision: "classify", functionSlug: "finance" },
        vocab,
      ),
    ).toBeNull();
  });

  it("does not offer unknown as a classify slug", () => {
    expect(classifySlugs(vocab)).not.toContain("unknown");
    expect(classifySlugs(vocab)).toContain("finance");
  });
});

describe("applyFunctionReview", () => {
  const matched = interpretTitle("Director", vocab);
  const employed = "employed";

  it("leaves matcher output when there is no review", () => {
    expect(applyFunctionReview(matched, null, employed, vocab)).toEqual(matched);
    expect(matched.function).toBe("unknown");
    expect(matched.inChart).toBe(true);
  });

  it("classifies to finance and keeps the row on-chart if employed", () => {
    const hit = applyFunctionReview(
      matched,
      { decision: "classify", functionSlug: "finance" },
      employed,
      vocab,
    );
    expect(hit.function).toBe("finance");
    expect(hit.inChart).toBe(true);
    expect(hit.seniority).toBe(matched.seniority);
  });

  it("classifies to ownership and keeps the row off-chart", () => {
    const hit = applyFunctionReview(
      matched,
      { decision: "classify", functionSlug: "ownership" },
      employed,
      vocab,
    );
    expect(hit.function).toBe("ownership");
    expect(hit.inChart).toBe(false);
  });

  it("ignore hides the row without changing the matcher function", () => {
    const hit = applyFunctionReview(
      matched,
      { decision: "ignore", functionSlug: null },
      employed,
      vocab,
    );
    expect(hit.function).toBe("unknown");
    expect(hit.inChart).toBe(false);
  });

  it("remain_unknown stays unknown and visible when employed", () => {
    const classified = interpretTitle("Account Executive", vocab);
    expect(classified.function).toBe("partnerships");
    const hit = applyFunctionReview(
      classified,
      { decision: "remain_unknown", functionSlug: null },
      employed,
      vocab,
    );
    expect(hit.function).toBe("unknown");
    expect(hit.inChart).toBe(true);
  });

  it("remain_unknown stays off-chart for board affiliation type", () => {
    const hit = applyFunctionReview(
      matched,
      { decision: "remain_unknown", functionSlug: null },
      "board",
      vocab,
    );
    expect(hit.function).toBe("unknown");
    expect(hit.inChart).toBe(false);
  });
});
