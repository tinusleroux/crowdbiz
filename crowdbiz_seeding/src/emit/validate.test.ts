import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";
import { parseCsv, validateBatchFiles } from "./validate";

describe("claim-schema validator", () => {
  it("accepts a minimal valid batch and RFC 4180 commas", () => {
    const organizations = toCsv(
      [
        "claim_id",
        "source_url",
        "source_type",
        "observed_at",
        "org_ref",
        "name",
        "org_type",
      ],
      [
        {
          claim_id: "crowdbiz-seed:r1:org:nfl-green-bay-packers",
          source_url: "https://www.packers.com",
          source_type: "profile_self_report",
          observed_at: "2026-08-29T11:00:00.000Z",
          org_ref: "nfl-green-bay-packers",
          name: "Green Bay Packers",
          org_type: "team",
        },
      ],
    );
    const persons = toCsv(
      [
        "claim_id",
        "source_url",
        "source_type",
        "observed_at",
        "person_ref",
        "full_name",
      ],
      [
        {
          claim_id: "crowdbiz-seed:r1:id:person",
          source_url: "https://www.linkedin.com/in/example",
          source_type: "profile_self_report",
          observed_at: "2026-08-29T11:00:00.000Z",
          person_ref: "linkedin:ACwAA",
          full_name: "Kristen Shand",
        },
      ],
    );
    const affiliations = toCsv(
      [
        "claim_id",
        "source_url",
        "source_type",
        "observed_at",
        "person_ref",
        "org_ref",
        "raw_title",
        "affiliation_type",
        "as_of",
      ],
      [
        {
          claim_id: "crowdbiz-seed:r1:id",
          source_url: "https://www.linkedin.com/in/example",
          source_type: "profile_self_report",
          observed_at: "2026-08-29T11:00:00.000Z",
          person_ref: "linkedin:ACwAA",
          org_ref: "nfl-green-bay-packers",
          raw_title: "Shand, MBA",
          affiliation_type: "employed",
          as_of: "2026-08-29",
        },
      ],
    );
    expect(
      validateBatchFiles({ organizations, persons, affiliations }),
    ).toEqual([]);
    const parsed = parseCsv(affiliations);
    expect(parsed.rows[0]?.raw_title).toBe("Shand, MBA");
  });

  it("rejects email headers and function/seniority", () => {
    const organizations = "claim_id,source_url,source_type,observed_at,org_ref,name,org_type,email\n";
    const persons = "claim_id,source_url,source_type,observed_at,person_ref,full_name,function\n";
    const affiliations =
      "claim_id,source_url,source_type,observed_at,person_ref,org_ref,raw_title,affiliation_type,as_of,seniority\n";
    const errors = validateBatchFiles({ organizations, persons, affiliations });
    expect(errors.some((e) => /email/i.test(e))).toBe(true);
    expect(errors.some((e) => /function/i.test(e))).toBe(true);
    expect(errors.some((e) => /seniority/i.test(e))).toBe(true);
  });

  it("rejects a source_type outside the contract's vocabulary", () => {
    const errors = validateBatchFiles(
      batch({ orgOverrides: { source_type: "linkedin" } }),
    );
    expect(errors).toContain(
      'organizations.csv row 2: unknown source_type "linkedin"',
    );
  });

  it("rejects an affiliation_type outside the contract's vocabulary", () => {
    const errors = validateBatchFiles(
      batch({ affOverrides: { affiliation_type: "staff" } }),
    );
    expect(errors).toContain(
      'affiliations.csv row 2: unknown affiliation_type "staff"',
    );
  });

  it("rejects non-ISO dates", () => {
    const errors = validateBatchFiles(
      batch({
        orgOverrides: { observed_at: "29/08/2026" },
        affOverrides: { as_of: "Aug 29 2026" },
      }),
    );
    expect(errors).toContain("organizations.csv row 2: observed_at must be ISO-8601");
    expect(errors).toContain("affiliations.csv row 2: as_of must be ISO-8601");
  });

  it("rejects a claim_id reused across files, since import keys on it", () => {
    const errors = validateBatchFiles(
      batch({ affOverrides: { claim_id: "crowdbiz-seed:r1:id:person" } }),
    );
    expect(
      errors.some((e) => /claim_id already used by persons\.csv row 2/.test(e)),
    ).toBe(true);
  });
});

function batch(
  overrides: {
    orgOverrides?: Record<string, string>;
    personOverrides?: Record<string, string>;
    affOverrides?: Record<string, string>;
  } = {},
) {
  const org = {
    claim_id: "crowdbiz-seed:r1:org:nfl-green-bay-packers",
    source_url: "https://www.packers.com",
    source_type: "profile_self_report",
    observed_at: "2026-08-29T11:00:00.000Z",
    org_ref: "nfl-green-bay-packers",
    name: "Green Bay Packers",
    org_type: "team",
    ...overrides.orgOverrides,
  };
  const person = {
    claim_id: "crowdbiz-seed:r1:id:person",
    source_url: "https://www.linkedin.com/in/example",
    source_type: "profile_self_report",
    observed_at: "2026-08-29T11:00:00.000Z",
    person_ref: "linkedin:ACwAA",
    full_name: "Kristen Shand",
    ...overrides.personOverrides,
  };
  const aff = {
    claim_id: "crowdbiz-seed:r1:id",
    source_url: "https://www.linkedin.com/in/example",
    source_type: "profile_self_report",
    observed_at: "2026-08-29T11:00:00.000Z",
    person_ref: "linkedin:ACwAA",
    org_ref: "nfl-green-bay-packers",
    raw_title: "Director of Retail",
    affiliation_type: "employed",
    as_of: "2026-08-29",
    ...overrides.affOverrides,
  };
  return {
    organizations: toCsv(Object.keys(org), [org]),
    persons: toCsv(Object.keys(person), [person]),
    affiliations: toCsv(Object.keys(aff), [aff]),
  };
}
