import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { batches, scrapeRuns } from "@/db/schema";
import { apifyConsoleRunUrl } from "@/lib/constants";
import { importEmittedBatch } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [run] = await db()
    .select()
    .from(scrapeRuns)
    .where(eq(scrapeRuns.id, id));
  if (!run) notFound();

  const [batch] = await db()
    .select()
    .from(batches)
    .where(eq(batches.scrapeRunId, id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Run {run.id.slice(0, 8)}</h1>
      <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
        <div>
          <dt className="text-zinc-500">Status</dt>
          <dd className="font-medium">{run.status}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">org_ref</dt>
          <dd className="font-mono text-xs">{run.orgRef}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">observed_at</dt>
          <dd>{run.observedAt?.toISOString() ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">maxItems</dt>
          <dd>{run.maxItems}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">USD cap</dt>
          <dd>{run.chargeCapUsd ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">collected / emitted / out</dt>
          <dd>
            {run.collected} / {run.emitted} / {run.curatedOut}
          </dd>
        </div>
      </dl>
      {run.errorText && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {run.errorText}
        </p>
      )}
      <ul className="space-y-1 text-sm">
        {run.apifyEmployeesRunId && (
          <li>
            Employees:{" "}
            <a
              className="underline"
              href={apifyConsoleRunUrl(run.apifyEmployeesRunId)}
              target="_blank"
              rel="noreferrer"
            >
              {run.apifyEmployeesRunId}
            </a>{" "}
            <span className="text-zinc-500">
              {run.apifyEmployeesActor} {run.apifyEmployeesBuild}
            </span>
          </li>
        )}
        {run.apifyVanityRunId && (
          <li>
            Vanity:{" "}
            <a
              className="underline"
              href={apifyConsoleRunUrl(run.apifyVanityRunId)}
              target="_blank"
              rel="noreferrer"
            >
              {run.apifyVanityRunId}
            </a>{" "}
            <span className="text-zinc-500">
              {run.apifyVanityActor} {run.apifyVanityBuild}
            </span>
          </li>
        )}
      </ul>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="underline" href={`/runs/${id}/raw`}>
          Inspect raw
        </Link>
        <Link className="underline" href={`/runs/${id}/curated`}>
          Inspect curated
        </Link>
        {batch && (
          <a className="underline" href={`/runs/${id}/download`}>
            Download batch zip
          </a>
        )}
        {batch?.validationOk && (
          <form action={importEmittedBatch}>
            <input type="hidden" name="batchId" value={batch.batchId} />
            <button type="submit" className="underline">
              Import to chart
            </button>
          </form>
        )}
      </div>
      {batch && (
        <pre className="overflow-x-auto rounded bg-zinc-100 p-3 text-xs">
          {JSON.stringify(batch.manifest, null, 2)}
        </pre>
      )}
    </div>
  );
}
