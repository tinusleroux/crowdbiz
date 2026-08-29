import { config } from "dotenv";
import { inArray } from "drizzle-orm";
import { db } from "../db";
import { organizations, scrapeRuns } from "../db/schema";

config({ path: ".env.local" });
config();

/**
 * Queue one scrape per organization. The worker drains them sequentially and
 * isolates failures, so a club whose company page has moved does not stop the
 * rest of the batch.
 *
 * Usage: pnpm enqueue [--max-items N] [--cap USD] [org_ref ...]
 * With no org_ref arguments, every organization is queued.
 */
async function main() {
  const argv = process.argv.slice(2);
  const maxItems = numericFlag(argv, "--max-items") ?? 200;
  const cap = numericFlag(argv, "--cap");
  const refs = argv.filter((a) => !a.startsWith("--") && !/^\d+(\.\d+)?$/.test(a));

  const orgs = await (refs.length
    ? db().select().from(organizations).where(inArray(organizations.orgRef, refs))
    : db().select().from(organizations));

  if (refs.length && orgs.length !== refs.length) {
    const found = new Set(orgs.map((o) => o.orgRef));
    throw new Error(`Unknown org_ref: ${refs.filter((r) => !found.has(r)).join(", ")}`);
  }
  if (orgs.length === 0) throw new Error("No organizations to queue");

  for (const org of orgs) {
    const [run] = await db()
      .insert(scrapeRuns)
      .values({
        orgRef: org.orgRef,
        status: "queued",
        maxItems,
        chargeCapUsd: cap != null ? String(cap) : null,
      })
      .returning();
    console.log(`  queued ${run?.id.slice(0, 8)}  ${org.orgRef}`);
  }

  console.log(
    `\nQueued ${orgs.length} runs at maxItems=${maxItems}` +
      (cap != null ? `, cap $${cap} each` : ", no charge cap") +
      `.\nStart the worker with \`pnpm worker\` if it is not already running.`,
  );
  process.exit(0);
}

function numericFlag(argv: string[], flag: string): number | undefined {
  const i = argv.indexOf(flag);
  if (i === -1) return undefined;
  const n = Number(argv[i + 1]);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${flag} needs a positive number`);
  return n;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
