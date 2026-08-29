import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { rawProfiles, scrapeRuns } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function RawPage({
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
  const rows = await db()
    .select()
    .from(rawProfiles)
    .where(eq(rawProfiles.scrapeRunId, id));

  return (
    <div className="space-y-4">
      <Link href={`/runs/${id}`} className="text-sm underline">
        ← Run
      </Link>
      <h1 className="text-2xl font-semibold">Raw profiles ({rows.length})</h1>
      <p className="text-sm text-zinc-600">
        Append-only as scraped. Titles are not editable.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="py-2">opaque_id</th>
              <th>Name</th>
              <th>Title</th>
              <th>Company</th>
              <th>Start</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 align-top">
                <td className="py-2 font-mono">{r.opaqueId}</td>
                <td>
                  {r.firstName} {r.lastName}
                </td>
                <td>{r.title}</td>
                <td>{r.company}</td>
                <td>
                  {r.startYear}
                  {r.startMonth ? `-${String(r.startMonth).padStart(2, "0")}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
