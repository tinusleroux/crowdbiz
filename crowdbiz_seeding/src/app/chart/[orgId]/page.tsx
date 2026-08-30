import Link from "next/link";
import { notFound } from "next/navigation";
import { loadOrgChart } from "@/graph/chart";

export const dynamic = "force-dynamic";

export default async function OrgChartPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const chart = await loadOrgChart(orgId);
  if (!chart) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/chart" className="text-sm text-zinc-600 underline">
          All charts
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{chart.org.name}</h1>
        <p className="text-sm text-zinc-500">
          {chart.org.orgType}
          {chart.org.sourceBatchId ? ` · batch ${chart.org.sourceBatchId}` : ""}
          {` · ${chart.groups.reduce((n, g) => n + g.people.length, 0)} on chart`}
          {chart.hidden > 0
            ? ` · ${chart.hidden} stored but off-chart (out of scope or not employed)`
            : ""}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Function and seniority are derived. Raw title is the source fact.
        </p>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-4">
        <div className="flex min-w-max gap-3">
          {chart.groups.map((group) => (
            <section
              key={group.functionSlug}
              className="w-64 shrink-0 rounded-lg border border-zinc-200 bg-white"
            >
              <h2 className="border-b border-zinc-100 px-3 py-2 text-sm font-semibold">
                {group.functionSlug === "unknown" ? (
                  <Link
                    href={`/review?org=${encodeURIComponent(orgId)}`}
                    className="underline"
                  >
                    {group.functionLabel}
                  </Link>
                ) : (
                  group.functionLabel
                )}
                <span className="ml-1 font-normal text-zinc-400">
                  {group.people.length}
                </span>
              </h2>
              <ol className="space-y-2 p-2">
                {group.people.map((p) => (
                  <li
                    key={p.personId}
                    className="rounded border border-zinc-100 bg-zinc-50 px-2 py-2"
                  >
                    <div className="text-sm font-medium">{p.fullName}</div>
                    <div className="text-xs text-zinc-700">{p.rawTitle}</div>
                    <div className="mt-1 text-[11px] text-zinc-500">
                      {p.seniorityLabel}
                      <span className="text-zinc-400"> · derived</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
