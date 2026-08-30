import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateBatchFiles } from "@/emit/validate";

describe("fixture-org-chart batch", () => {
  it("passes the claim contract", () => {
    const dir = path.resolve("data/fixture-org-chart");
    const errors = validateBatchFiles({
      organizations: readFileSync(path.join(dir, "organizations.csv"), "utf8"),
      persons: readFileSync(path.join(dir, "persons.csv"), "utf8"),
      affiliations: readFileSync(path.join(dir, "affiliations.csv"), "utf8"),
    });
    expect(errors).toEqual([]);
  });
});
