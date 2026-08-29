import path from "node:path";
import { eq } from "drizzle-orm";
import {
  curateTitle,
  formatStartDate,
  stripCredentialsFromName,
} from "@/curation";
import { db } from "@/db";
import {
  batches,
  curatedProfiles,
  organizations,
  rawProfiles,
  scrapeRuns,
} from "@/db/schema";
import { writeClaimBatch } from "@/emit/writer";
import { batchesDir, EMPLOYEES_ACTOR, VANITY_ACTOR } from "@/lib/constants";
import { sanitizePayload } from "@/lib/sanitize";
import {
  employeesInput,
  fetchDatasetItems,
  startActor,
  vanityInput,
  waitForRun,
} from "./apify";
import { mapEmployeeItem, vanityFromProfileItem } from "./map-item";

const TERMINAL = new Set(["emitted", "failed"]);

export async function processQueuedRuns(): Promise<void> {
  const queued = await db()
    .select()
    .from(scrapeRuns)
    .where(eq(scrapeRuns.status, "queued"));
  for (const run of queued) {
    await processRun(run.id).catch(async (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Run ${run.id} failed:`, message);
      await db()
        .update(scrapeRuns)
        .set({
          status: "failed",
          errorText: message,
          updatedAt: new Date(),
        })
        .where(eq(scrapeRuns.id, run.id));
    });
  }
}

export async function processRun(runId: string): Promise<void> {
  const [run] = await db()
    .select()
    .from(scrapeRuns)
    .where(eq(scrapeRuns.id, runId));
  if (!run || TERMINAL.has(run.status)) return;

  const [org] = await db()
    .select()
    .from(organizations)
    .where(eq(organizations.orgRef, run.orgRef));
  if (!org) throw new Error(`Unknown org ${run.orgRef}`);

  const cap = run.chargeCapUsd != null ? Number(run.chargeCapUsd) : null;

  if (run.status === "queued") {
    await setStatus(runId, "collecting");
    const started = await startActor(
      EMPLOYEES_ACTOR,
      employeesInput(
        org.linkedinCompanyUrl,
        run.maxItems,
        org.excludeOwnership,
      ),
      cap,
    );
    await db()
      .update(scrapeRuns)
      .set({
        apifyEmployeesRunId: started.id,
        apifyEmployeesActor: EMPLOYEES_ACTOR,
        apifyEmployeesBuild: started.buildId ?? null,
        observedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(scrapeRuns.id, runId));
    const finished = await waitForRun(started.id);
    if (finished.status !== "SUCCEEDED") {
      throw new Error(
        `Employees scrape ${started.id} ended ${finished.status}`,
      );
    }
    const datasetId = finished.defaultDatasetId;
    if (!datasetId) throw new Error("Employees run had no dataset");
    await persistRaw(runId, datasetId);
    await db()
      .update(scrapeRuns)
      .set({
        apifyEmployeesBuild: finished.buildId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(scrapeRuns.id, runId));
  }

  const fresh = await reload(runId);
  if (fresh.status === "collecting") {
    await curateRun(runId, org.displayName);
    await setStatus(runId, "enriching");
  }

  const afterCurate = await reload(runId);
  if (afterCurate.status === "enriching") {
    await enrichVanity(runId, cap);
    await setStatus(runId, "curating");
  }

  const afterVanity = await reload(runId);
  if (afterVanity.status === "curating" || afterVanity.status === "enriching") {
    await emitRun(runId, org);
  }
}

async function persistRaw(runId: string, datasetId: string) {
  const items = await fetchDatasetItems(datasetId);
  for (const item of items) {
    const mapped = mapEmployeeItem(item);
    if (!mapped) continue;
    const payload = sanitizePayload(item);
    await db()
      .insert(rawProfiles)
      .values({
        scrapeRunId: runId,
        opaqueId: mapped.opaqueId,
        firstName: mapped.firstName,
        lastName: mapped.lastName,
        title: mapped.title,
        company: mapped.company,
        startYear: mapped.startYear,
        startMonth: mapped.startMonth,
        memberUrl: mapped.memberUrl,
        datasetItemId: mapped.datasetItemId,
        payload,
      })
      .onConflictDoNothing({
        target: [rawProfiles.scrapeRunId, rawProfiles.opaqueId],
      });
  }
  const collected = (
    await db()
      .select()
      .from(rawProfiles)
      .where(eq(rawProfiles.scrapeRunId, runId))
  ).length;
  await db()
    .update(scrapeRuns)
    .set({ collected, updatedAt: new Date() })
    .where(eq(scrapeRuns.id, runId));
}

async function curateRun(runId: string, orgName: string) {
  await db().delete(curatedProfiles).where(eq(curatedProfiles.scrapeRunId, runId));
  const raws = await db()
    .select()
    .from(rawProfiles)
    .where(eq(rawProfiles.scrapeRunId, runId));
  for (const raw of raws) {
    const fullName = stripCredentialsFromName(raw.firstName, raw.lastName);
    const decision = !fullName
      ? ({ keep: false, dropReason: "other" } as const)
      : curateTitle(raw.title, raw.company, orgName);
    await db()
      .insert(curatedProfiles)
      .values({
        scrapeRunId: runId,
        rawProfileId: raw.id,
        outcome: decision.keep ? "keep" : "drop",
        dropReason: decision.keep ? null : decision.dropReason,
        fullName: fullName || "(unnamed)",
        rawTitle: raw.title ?? "",
        personRef: `linkedin:${raw.opaqueId}`,
        vanityUrl: null,
        startDate: formatStartDate(raw.startYear, raw.startMonth),
        affiliationType: "employed",
      });
  }
}

async function enrichVanity(runId: string, cap: number | null) {
  const keepers = await db()
    .select({
      curated: curatedProfiles,
      raw: rawProfiles,
    })
    .from(curatedProfiles)
    .innerJoin(rawProfiles, eq(curatedProfiles.rawProfileId, rawProfiles.id))
    .where(eq(curatedProfiles.scrapeRunId, runId));

  const keepRows = keepers.filter((k) => k.curated.outcome === "keep");
  const ids = keepRows.map((k) => k.raw.opaqueId);
  if (ids.length === 0) return;

  const started = await startActor(VANITY_ACTOR, vanityInput(ids), cap);
  await db()
    .update(scrapeRuns)
    .set({
      apifyVanityRunId: started.id,
      apifyVanityActor: VANITY_ACTOR,
      apifyVanityBuild: started.buildId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(scrapeRuns.id, runId));

  const finished = await waitForRun(started.id);
  if (finished.status !== "SUCCEEDED") {
    throw new Error(`Vanity scrape ${started.id} ended ${finished.status}`);
  }
  const datasetId = finished.defaultDatasetId;
  if (!datasetId) throw new Error("Vanity run had no dataset");
  const items = await fetchDatasetItems(datasetId);
  await applyVanityItems(runId, items);
}

async function applyVanityItems(
  runId: string,
  items: Record<string, unknown>[],
) {
  const keepRows = (
    await db()
      .select({
        curated: curatedProfiles,
        raw: rawProfiles,
      })
      .from(curatedProfiles)
      .innerJoin(rawProfiles, eq(curatedProfiles.rawProfileId, rawProfiles.id))
      .where(eq(curatedProfiles.scrapeRunId, runId))
  ).filter((row) => row.curated.outcome === "keep");

  const byOpaque = new Map<string, string>();
  for (const item of items) {
    const { opaqueId, vanityUrl } = vanityFromProfileItem(item);
    if (opaqueId && vanityUrl) byOpaque.set(opaqueId, vanityUrl);
  }
  for (const row of keepRows) {
    // Left null when neither enrichment nor the listing gave a real URL. An
    // opaque ID is not a vanity slug, and `/in/<opaqueId>` does not resolve.
    const vanity = byOpaque.get(row.raw.opaqueId) ?? row.raw.memberUrl ?? null;
    if (!vanity) continue;
    await db()
      .update(curatedProfiles)
      .set({ vanityUrl: vanity })
      .where(eq(curatedProfiles.id, row.curated.id));
  }
  return {
    updated: keepRows.filter((row) => byOpaque.has(row.raw.opaqueId)).length,
    keepers: keepRows.length,
  };
}

async function emitRun(runId: string, org: typeof organizations.$inferSelect) {
  const [run] = await db()
    .select()
    .from(scrapeRuns)
    .where(eq(scrapeRuns.id, runId));
  if (!run) return;
  const curated = await db()
    .select()
    .from(curatedProfiles)
    .where(eq(curatedProfiles.scrapeRunId, runId));
  const keepers = curated.filter((c) => c.outcome === "keep");
  const curatedOut = curated.filter((c) => c.outcome === "drop").length;
  const raws = await db()
    .select()
    .from(rawProfiles)
    .where(eq(rawProfiles.scrapeRunId, runId));
  const opaqueByRawId = new Map(raws.map((r) => [r.id, r.opaqueId]));

  const observed = (run.observedAt ?? new Date()).toISOString();
  const generated = new Date();
  const employeesRunId = run.apifyEmployeesRunId ?? runId;
  const batchId = `${org.orgRef}-${observed.slice(0, 10)}-${runId.slice(0, 8)}`;
  const dir = path.resolve(batchesDir(), batchId);

  const result = await writeClaimBatch({
    batchId,
    scrapeRunId: runId,
    employeesRunId,
    collector: `apify/${EMPLOYEES_ACTOR}`,
    observedAtIso: observed,
    generatedAtIso: generated.toISOString(),
    dir,
    collected: run.collected,
    curatedOut,
    org: {
      orgRef: org.orgRef,
      name: org.displayName,
      orgType: org.orgType,
      website: org.website,
      companyUrl: org.linkedinCompanyUrl,
    },
    keepers: keepers.map((k) => ({
      opaqueId:
        opaqueByRawId.get(k.rawProfileId) ??
        k.personRef.replace(/^linkedin:/, ""),
      fullName: k.fullName,
      rawTitle: k.rawTitle,
      profileUrl: k.vanityUrl,
      startDate: k.startDate,
      personRef: k.personRef,
    })),
  });

  const status = result.validationOk ? "emitted" : "failed";
  await db()
    .insert(batches)
    .values({
      batchId,
      scrapeRunId: runId,
      filesystemPath: dir,
      generatedAt: generated,
      manifest: result.manifest,
      validationOk: result.validationOk,
      validationErrors: result.validationErrors,
    })
    .onConflictDoUpdate({
      target: batches.batchId,
      set: {
        filesystemPath: dir,
        generatedAt: generated,
        manifest: result.manifest,
        validationOk: result.validationOk,
        validationErrors: result.validationErrors,
      },
    });
  await db()
    .update(scrapeRuns)
    .set({
      status,
      emitted: keepers.length,
      curatedOut,
      errorText: result.validationOk ? null : result.validationErrors.join("; "),
      updatedAt: new Date(),
    })
    .where(eq(scrapeRuns.id, runId));
}

async function setStatus(runId: string, status: string) {
  await db()
    .update(scrapeRuns)
    .set({ status, updatedAt: new Date() })
    .where(eq(scrapeRuns.id, runId));
}

async function reload(runId: string) {
  const [run] = await db()
    .select()
    .from(scrapeRuns)
    .where(eq(scrapeRuns.id, runId));
  if (!run) throw new Error(`Run ${runId} vanished`);
  return run;
}

/** Persist raw from an existing Apify dataset (pilot replay). */
export async function ingestExistingDataset(runId: string, datasetId: string) {
  await persistRaw(runId, datasetId);
}

/** Reuse a completed vanity dataset and regenerate this run's existing batch. */
export async function repairVanityFromDataset(
  runId: string,
  datasetId: string,
) {
  const items = await fetchDatasetItems(datasetId);
  const counts = await applyVanityItems(runId, items);
  if (counts.updated !== counts.keepers) {
    throw new Error(
      `Matched ${counts.updated} of ${counts.keepers} keeper profiles for run ${runId}`,
    );
  }

  const [run] = await db()
    .select()
    .from(scrapeRuns)
    .where(eq(scrapeRuns.id, runId));
  if (!run) throw new Error(`Run ${runId} not found`);
  const [org] = await db()
    .select()
    .from(organizations)
    .where(eq(organizations.orgRef, run.orgRef));
  if (!org) throw new Error(`Organization ${run.orgRef} not found`);

  await emitRun(runId, org);
  return counts;
}
