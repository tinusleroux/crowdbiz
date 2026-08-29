import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { curatedProfiles, scrapeRuns } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function CuratedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ outcome?: string }>;
}) {
  const { id } = await params;
  const { outcome } = await searchParams;
  const [run] = await db()
    .select()
    .from(scrapeRuns)
    .where(eq(scrapeRuns.id, id));
  if (!run) notFound();
  const rows = await db()
    .select()
    .from(curatedProfiles)
    .where(eq(curatedProfiles.scrapeRunId, id));
  const filtered =
    outcome === "keep" || outcome === "drop"
      ? rows.filter((r) => r.outcome === outcome)
      : rows;

  return (
    <div className="space-y-4">
      <Link href={`/runs/${id}`} className="text-sm underline">
        ← Run
      </Link>
      <h1 className="text-2xl font-semibold">
        Curated profiles ({filtered.length})
      </h1>
      <div className="flex gap-3 text-sm">
        <Link href={`/runs/${id}/curated`} className="underline">
          all
        </Link>
        <Link href={`/runs/${id}/curated?outcome=keep`} className="underline">
          keep
        </Link>
        <Link href={`/runs/${id}/curated?outcome=drop`} className="underline">
          drop
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="py-2">Outcome</th>
              <th>Reason</th>
              <th>Name</th>
              <th>raw_title</th>
              <th>start_date</th>
              <th>vanity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 align-top">
                <td className="py-2">{r.outcome}</td>
                <td>{r.dropReason ?? "—"}</td>
                <td>{r.fullName}</td>
                <td>{r.rawTitle}</td>
                <td>{r.startDate ?? "—"}</td>
                <td className="max-w-xs truncate font-mono">
                  {r.vanityUrl ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
