import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  graphAffiliations,
  graphFunctionReviews,
  graphOrganizations,
  graphPersons,
  rawProfiles,
} from "@/db/schema";

export type QueueRow = {
  affiliationId: string;
  orgId: string;
  orgName: string;
  personId: string;
  fullName: string;
  rawTitle: string;
  affiliationType: string;
  publicProfileUrl: string | null;
  profileAbout: string | null;
};

/** Matcher-unknown affiliations with no human decision yet. */
export async function loadReviewQueue(orgId?: string): Promise<QueueRow[]> {
  const conds = [
    eq(graphAffiliations.functionSlug, "unknown"),
    isNull(graphFunctionReviews.affiliationId),
  ];
  if (orgId) conds.push(eq(graphAffiliations.orgId, orgId));

  const rows = await db()
    .select({
      affiliationId: graphAffiliations.affiliationId,
      orgId: graphAffiliations.orgId,
      orgName: graphOrganizations.name,
      personId: graphAffiliations.personId,
      fullName: graphPersons.fullName,
      rawTitle: graphAffiliations.rawTitle,
      affiliationType: graphAffiliations.affiliationType,
      publicProfileUrl: graphPersons.publicProfileUrl,
    })
    .from(graphAffiliations)
    .innerJoin(
      graphOrganizations,
      eq(graphAffiliations.orgId, graphOrganizations.orgId),
    )
    .innerJoin(
      graphPersons,
      eq(graphAffiliations.personId, graphPersons.personId),
    )
    .leftJoin(
      graphFunctionReviews,
      eq(graphAffiliations.affiliationId, graphFunctionReviews.affiliationId),
    )
    .where(and(...conds));

  const opaqueIds = [
    ...new Set(
      rows
        .map((row) => row.personId.replace(/^linkedin:/, ""))
        .filter(Boolean),
    ),
  ];
  if (!opaqueIds.length) {
    return rows.map((row) => ({ ...row, profileAbout: null }));
  }

  // About is producer/review context, not graph truth. Prefer the newest
  // profile enrichment when the same LinkedIn identity appears in many runs.
  const profiles = await db()
    .select({
      opaqueId: rawProfiles.opaqueId,
      profileAbout: rawProfiles.profileAbout,
    })
    .from(rawProfiles)
    .where(inArray(rawProfiles.opaqueId, opaqueIds))
    .orderBy(desc(rawProfiles.createdAt));
  const aboutByOpaque = new Map<string, string>();
  for (const profile of profiles) {
    if (profile.profileAbout && !aboutByOpaque.has(profile.opaqueId)) {
      aboutByOpaque.set(profile.opaqueId, profile.profileAbout);
    }
  }

  return rows.map((row) => ({
    ...row,
    profileAbout:
      aboutByOpaque.get(row.personId.replace(/^linkedin:/, "")) ?? null,
  }));
}

export async function loadFunctionReviews() {
  return db()
    .select({
      review: graphFunctionReviews,
      orgName: graphOrganizations.name,
      fullName: graphPersons.fullName,
    })
    .from(graphFunctionReviews)
    .leftJoin(
      graphOrganizations,
      eq(graphFunctionReviews.orgId, graphOrganizations.orgId),
    )
    .leftJoin(
      graphPersons,
      eq(graphFunctionReviews.personId, graphPersons.personId),
    )
    .orderBy(desc(graphFunctionReviews.updatedAt));
}
