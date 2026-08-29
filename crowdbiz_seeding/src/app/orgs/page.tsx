import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { organizations, scrapeRuns } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function OrgsPage() {
  const orgs = await db().select().from(organizations);
  const runs = await db()
    .select()
    .from(scrapeRuns)
    .orderBy(desc(scrapeRuns.createdAt))
    .limit(30);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <Link
          href="/orgs/new"
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white"
        >
          Add organization
        </Link>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-zinc-500">
            <th className="py-2">org_ref</th>
            <th>Name</th>
            <th>LinkedIn company</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((o) => (
            <tr key={o.orgRef} className="border-b border-zinc-100">
              <td className="py-2 font-mono text-xs">{o.orgRef}</td>
              <td>{o.displayName}</td>
              <td className="font-mono text-xs">{o.linkedinCompanyUrl}</td>
            </tr>
          ))}
          {orgs.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-zinc-500">
                No organizations yet. Add one, or run{" "}
                <code>pnpm db:seed</code>.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent runs</h2>
        <Link
          href="/runs/new"
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm"
        >
          Start scrape
        </Link>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-zinc-500">
            <th className="py-2">Run</th>
            <th>Org</th>
            <th>Status</th>
            <th>Collected</th>
            <th>Emitted</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id} className="border-b border-zinc-100">
              <td className="py-2">
                <Link className="underline" href={`/runs/${r.id}`}>
                  {r.id.slice(0, 8)}
                </Link>
              </td>
              <td className="font-mono text-xs">{r.orgRef}</td>
              <td>{r.status}</td>
              <td>{r.collected}</td>
              <td>{r.emitted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
