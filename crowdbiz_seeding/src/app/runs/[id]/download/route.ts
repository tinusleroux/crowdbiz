import { createReadStream } from "node:fs";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ZipArchive } from "archiver";
import { db } from "@/db";
import { batches, scrapeRuns } from "@/db/schema";

export const dynamic = "force-dynamic";

const BATCH_FILES = [
  "manifest.json",
  "organizations.csv",
  "persons.csv",
  "affiliations.csv",
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
  if (!batch) notFound();

  const archive = new ZipArchive({ zlib: { level: 9 } });
  for (const file of BATCH_FILES) {
    archive.append(createReadStream(`${batch.filesystemPath}/${file}`), {
      name: file,
    });
  }

  const done = archive.finalize();
  const chunks: Buffer[] = [];
  for await (const chunk of archive) {
    chunks.push(Buffer.from(chunk as Buffer));
  }
  await done;

  return new Response(new Uint8Array(Buffer.concat(chunks)), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${batch.batchId}.zip"`,
    },
  });
}
