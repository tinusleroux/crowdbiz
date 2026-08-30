import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  graphAffiliations,
  graphOrganizations,
  graphPersons,
} from "@/db/schema";
import { loadVocab } from "./vocab";

export type ChartPerson = {
  personId: string;
  fullName: string;
  rawTitle: string;
  senioritySlug: string;
  seniorityLabel: string;
  rank: number | null;
  publicProfileUrl: string | null;
};

export type ChartGroup = {
  functionSlug: string;
  functionLabel: string;
  people: ChartPerson[];
};

export async function loadOrgChart(orgId: string) {
  const vocab = loadVocab();
  const [org] = await db()
    .select()
    .from(graphOrganizations)
    .where(eq(graphOrganizations.orgId, orgId));
  if (!org) return null;

  const rows = await db()
    .select({
      aff: graphAffiliations,
      person: graphPersons,
    })
    .from(graphAffiliations)
    .innerJoin(graphPersons, eq(graphAffiliations.personId, graphPersons.personId))
    .where(eq(graphAffiliations.orgId, orgId));

  const hidden = rows.filter((r) => !r.aff.inChart).length;
  const visible = rows.filter((r) => r.aff.inChart);

  const byFn = new Map<string, ChartPerson[]>();
  for (const row of visible) {
    const band = vocab.seniority.bands.find(
      (b) => b.slug === row.aff.senioritySlug,
    );
    const person: ChartPerson = {
      personId: row.person.personId,
      fullName: row.person.fullName,
      rawTitle: row.aff.rawTitle,
      senioritySlug: row.aff.senioritySlug,
      seniorityLabel: band?.label ?? row.aff.senioritySlug,
      rank: band?.rank ?? null,
      publicProfileUrl: row.person.publicProfileUrl,
    };
    const list = byFn.get(row.aff.functionSlug) ?? [];
    list.push(person);
    byFn.set(row.aff.functionSlug, list);
  }

  const groups: ChartGroup[] = [];
  for (const fn of vocab.functions) {
    const people = byFn.get(fn.slug);
    if (!people?.length) continue;
    people.sort((a, b) => {
      if (a.rank == null && b.rank == null) {
        return a.fullName.localeCompare(b.fullName);
      }
      if (a.rank == null) return 1;
      if (b.rank == null) return -1;
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.fullName.localeCompare(b.fullName);
    });
    groups.push({
      functionSlug: fn.slug,
      functionLabel: fn.label,
      people,
    });
  }

  return { org, groups, hidden, total: rows.length };
}
