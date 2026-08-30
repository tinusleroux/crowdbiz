import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PRODUCER_ID } from "@/lib/constants";
import { toCsv } from "./csv";
import { validateBatchFiles } from "./validate";

export type EmitOrg = {
  orgRef: string;
  name: string;
  orgType: string;
  website: string | null;
  /** The company page the people listing was read from. */
  companyUrl: string;
};

export type EmitPerson = {
  opaqueId: string;
  fullName: string;
  rawTitle: string;
  /** Null when vanity enrichment did not resolve a real profile URL. */
  profileUrl: string | null;
  startDate: string | null;
  personRef: string;
  /** Closed set from the claim contract; decided in curation. */
  affiliationType: string;
};

export type EmitInput = {
  batchId: string;
  scrapeRunId: string;
  employeesRunId: string;
  collector: string;
  observedAtIso: string;
  generatedAtIso: string;
  dir: string;
  collected: number;
  curatedOut: number;
  org: EmitOrg;
  keepers: EmitPerson[];
};

export type EmitResult = {
  dir: string;
  manifest: Record<string, unknown>;
  validationOk: boolean;
  validationErrors: string[];
};

const ORG_HEADERS = [
  "claim_id",
  "source_url",
  "source_type",
  "observed_at",
  "org_ref",
  "name",
  "org_type",
  "website",
];

const PERSON_HEADERS = [
  "claim_id",
  "source_url",
  "source_type",
  "observed_at",
  "person_ref",
  "full_name",
  "public_profile_url",
  "public_profile_id",
];

const AFF_HEADERS = [
  "claim_id",
  "source_url",
  "source_type",
  "observed_at",
  "person_ref",
  "org_ref",
  "raw_title",
  "affiliation_type",
  "start_date",
  "as_of",
];

export async function writeClaimBatch(input: EmitInput): Promise<EmitResult> {
  await mkdir(input.dir, { recursive: true });
  const asOf = input.observedAtIso.slice(0, 10);

  const organizations = toCsv(ORG_HEADERS, [
    {
      claim_id: `${PRODUCER_ID}:${input.employeesRunId}:org:${input.org.orgRef}`,
      source_url: input.org.companyUrl,
      source_type: "profile_self_report",
      observed_at: input.observedAtIso,
      org_ref: input.org.orgRef,
      name: input.org.name,
      org_type: input.org.orgType,
      website: input.org.website ?? "",
    },
  ]);

  // Where the profile URL did not resolve, the company listing is where the row
  // was genuinely seen. Synthesising `/in/<opaqueId>` would read as a profile
  // URL and 404, putting a claim on the record that nobody can check.
  const sourceUrlFor = (p: EmitPerson) => p.profileUrl ?? input.org.companyUrl;

  const persons = toCsv(
    PERSON_HEADERS,
    input.keepers.map((p) => ({
      claim_id: `${PRODUCER_ID}:${input.employeesRunId}:${p.opaqueId}:person`,
      source_url: sourceUrlFor(p),
      source_type: "profile_self_report",
      observed_at: input.observedAtIso,
      person_ref: p.personRef,
      full_name: p.fullName,
      public_profile_url: p.profileUrl ?? "",
      public_profile_id: p.opaqueId,
    })),
  );

  const affiliations = toCsv(
    AFF_HEADERS,
    input.keepers.map((p) => ({
      claim_id: `${PRODUCER_ID}:${input.employeesRunId}:${p.opaqueId}`,
      source_url: sourceUrlFor(p),
      source_type: "profile_self_report",
      observed_at: input.observedAtIso,
      person_ref: p.personRef,
      org_ref: input.org.orgRef,
      raw_title: p.rawTitle,
      affiliation_type: p.affiliationType,
      start_date: p.startDate ?? "",
      as_of: asOf,
    })),
  );

  const validationErrors = validateBatchFiles({
    organizations,
    persons,
    affiliations,
  });

  const manifest = {
    producer: PRODUCER_ID,
    batch_id: input.batchId,
    generated_at: input.generatedAtIso,
    org_scope: input.org.orgRef,
    collection: {
      method: "profile_scrape",
      collector: input.collector,
      run_id: input.employeesRunId,
      observed_at: input.observedAtIso,
    },
    counts: {
      collected: input.collected,
      emitted: input.keepers.length,
      curated_out: input.curatedOut,
    },
  };

  await writeFile(path.join(input.dir, "organizations.csv"), organizations, "utf8");
  await writeFile(path.join(input.dir, "persons.csv"), persons, "utf8");
  await writeFile(path.join(input.dir, "affiliations.csv"), affiliations, "utf8");
  await writeFile(
    path.join(input.dir, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8",
  );

  return {
    dir: input.dir,
    manifest,
    validationOk: validationErrors.length === 0,
    validationErrors,
  };
}
