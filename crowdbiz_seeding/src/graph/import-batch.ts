import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  graphAffiliations,
  graphFunctionReviews,
  graphOrganizations,
  graphPersons,
} from "@/db/schema";
import { parseCsv, validateBatchFiles } from "@/emit/validate";
import {
  applyFunctionReview,
  isReviewDecision,
  type FunctionReview,
} from "./apply-review";
import { interpretAffiliation } from "./interpret";
import { loadVocab } from "./vocab";

export type ImportResult = {
  batchId: string;
  dir: string;
  orgs: number;
  persons: number;
  affiliations: number;
};

export async function importClaimBatch(dir: string): Promise<ImportResult> {
  const organizations = await readFile(path.join(dir, "organizations.csv"), "utf8");
  const persons = await readFile(path.join(dir, "persons.csv"), "utf8");
  const affiliations = await readFile(path.join(dir, "affiliations.csv"), "utf8");
  const errors = validateBatchFiles({ organizations, persons, affiliations });
  if (errors.length) {
    throw new Error(`Batch failed validation:\n${errors.join("\n")}`);
  }

  let batchId = path.basename(dir);
  try {
    const manifest = JSON.parse(
      await readFile(path.join(dir, "manifest.json"), "utf8"),
    ) as { batch_id?: string };
    if (manifest.batch_id) batchId = manifest.batch_id;
  } catch {
    // manifest is optional for a hand-built fixture
  }

  const orgRows = parseCsv(organizations).rows;
  const personRows = parseCsv(persons).rows;
  const affRows = parseCsv(affiliations).rows;
  const vocab = loadVocab();
  const orgIds = [...new Set(orgRows.map((r) => r.org_ref))];

  for (const row of orgRows) {
    await db()
      .insert(graphOrganizations)
      .values({
        orgId: row.org_ref,
        name: row.name,
        orgType: row.org_type,
        website: row.website?.trim() ? row.website : null,
        sourceBatchId: batchId,
      })
      .onConflictDoUpdate({
        target: graphOrganizations.orgId,
        set: {
          name: row.name,
          orgType: row.org_type,
          website: row.website?.trim() ? row.website : null,
          sourceBatchId: batchId,
        },
      });
  }

  for (const row of personRows) {
    await db()
      .insert(graphPersons)
      .values({
        personId: row.person_ref,
        fullName: row.full_name,
        publicProfileUrl: row.public_profile_url?.trim()
          ? row.public_profile_url
          : null,
      })
      .onConflictDoUpdate({
        target: graphPersons.personId,
        set: {
          fullName: row.full_name,
          publicProfileUrl: row.public_profile_url?.trim()
            ? row.public_profile_url
            : null,
        },
      });
  }

  if (orgIds.length) {
    await db()
      .delete(graphAffiliations)
      .where(inArray(graphAffiliations.orgId, orgIds));
  }

  const orgNameById = new Map(orgRows.map((r) => [r.org_ref, r.name]));
  const reviews = await loadReviewMap(affRows.map((r) => r.claim_id));

  for (const row of affRows) {
    const derived = deriveWithReview(
      {
        rawTitle: row.raw_title,
        affiliationType: row.affiliation_type,
        orgName: orgNameById.get(row.org_ref),
      },
      reviews.get(row.claim_id),
      vocab,
    );
    await db().insert(graphAffiliations).values({
      affiliationId: row.claim_id,
      personId: row.person_ref,
      orgId: row.org_ref,
      affiliationType: row.affiliation_type,
      rawTitle: row.raw_title,
      startDate: row.start_date?.trim() ? row.start_date : null,
      asOf: row.as_of,
      functionSlug: derived.function,
      senioritySlug: derived.seniority,
      inChart: derived.inChart,
    });
  }

  return {
    batchId,
    dir,
    orgs: orgRows.length,
    persons: personRows.length,
    affiliations: affRows.length,
  };
}

export async function reinterpretGraph(): Promise<number> {
  const vocab = loadVocab();
  const orgs = await db().select().from(graphOrganizations);
  const orgNameById = new Map(orgs.map((o) => [o.orgId, o.name]));
  const rows = await db().select().from(graphAffiliations);
  const reviews = await loadReviewMap(rows.map((r) => r.affiliationId));
  for (const row of rows) {
    const derived = deriveWithReview(
      {
        rawTitle: row.rawTitle,
        affiliationType: row.affiliationType,
        orgName: orgNameById.get(row.orgId),
      },
      reviews.get(row.affiliationId),
      vocab,
    );
    await db()
      .update(graphAffiliations)
      .set({
        functionSlug: derived.function,
        senioritySlug: derived.seniority,
        inChart: derived.inChart,
      })
      .where(eq(graphAffiliations.affiliationId, row.affiliationId));
  }
  return rows.length;
}

export async function recomputeAffiliation(
  affiliationId: string,
): Promise<void> {
  const vocab = loadVocab();
  const [row] = await db()
    .select()
    .from(graphAffiliations)
    .where(eq(graphAffiliations.affiliationId, affiliationId));
  if (!row) return;
  const [org] = await db()
    .select()
    .from(graphOrganizations)
    .where(eq(graphOrganizations.orgId, row.orgId));
  const reviews = await loadReviewMap([affiliationId]);
  const derived = deriveWithReview(
    {
      rawTitle: row.rawTitle,
      affiliationType: row.affiliationType,
      orgName: org?.name,
    },
    reviews.get(affiliationId),
    vocab,
  );
  await db()
    .update(graphAffiliations)
    .set({
      functionSlug: derived.function,
      senioritySlug: derived.seniority,
      inChart: derived.inChart,
    })
    .where(eq(graphAffiliations.affiliationId, affiliationId));
}

async function loadReviewMap(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map<string, FunctionReview>();
  const rows = await db()
    .select()
    .from(graphFunctionReviews)
    .where(inArray(graphFunctionReviews.affiliationId, unique));
  return new Map(
    rows.flatMap((row) => {
      if (!isReviewDecision(row.decision)) return [];
      return [
        [
          row.affiliationId,
          {
            decision: row.decision,
            functionSlug: row.functionSlug,
          } satisfies FunctionReview,
        ],
      ];
    }),
  );
}

function deriveWithReview(
  input: Parameters<typeof interpretAffiliation>[0],
  review: FunctionReview | undefined,
  vocab: ReturnType<typeof loadVocab>,
) {
  const matched = interpretAffiliation(input, vocab);
  return applyFunctionReview(
    matched,
    review,
    input.affiliationType ?? "employed",
    vocab,
  );
}
