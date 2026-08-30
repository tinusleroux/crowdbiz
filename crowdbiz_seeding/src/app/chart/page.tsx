import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import {
  importEmittedBatch,
  importFixtureBatch,
  reinterpretAll,
} from "@/app/actions";
import { db } from "@/db";
import { batches, graphOrganizations } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function ChartIndexPage() {
  const orgs = await db().select().from(graphOrganizations);
  const emitted = await db()
    .select()
    .from(batches)
    .where(eq(batches.validationOk, true))
    .orderBy(desc(batches.generatedAt));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Org charts</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Import a claim batch, interpret titles from the accepted YAML, then
          open a chart. Matching is a first pass; slugs stay stable.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Imported organizations</h2>
        {orgs.length === 0 ? (
          <p className="text-sm text-zinc-500">None yet. Import a batch.</p>
        ) : (
          <ul className="divide-y rounded border border-zinc-200 bg-white">
            {orgs.map((o) => (
              <li key={o.orgId} className="flex items-center justify-between px-3 py-2">
                <div>
                  <Link className="font-medium underline" href={`/chart/${o.orgId}`}>
                    {o.name}
                  </Link>
                  <div className="font-mono text-xs text-zinc-500">{o.orgId}</div>
                </div>
                <span className="text-xs text-zinc-500">{o.orgType}</span>
              </li>
            ))}
          </ul>
        )}
        <form action={reinterpretAll}>
          <button
            type="submit"
            className="text-sm text-zinc-600 underline"
            disabled={orgs.length === 0}
          >
            Re-run interpretation
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Import</h2>
        <form action={importFixtureBatch}>
          <button
            type="submit"
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white"
          >
            Import fixture batch
          </button>
        </form>
        {emitted.length > 0 && (
          <form action={importEmittedBatch} className="flex items-end gap-2">
            <label className="block text-sm">
              Emitted scrape batch
              <select
                name="batchId"
                className="mt-1 block rounded border border-zinc-300 px-3 py-2 text-sm"
              >
                {emitted.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchId}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            >
              Import
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
