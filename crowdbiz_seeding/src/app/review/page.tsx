import Link from "next/link";
import { classifySlugs } from "@/graph/apply-review";
import { loadReviewQueue } from "@/graph/review-queue";
import { loadVocab } from "@/graph/vocab";
import { ReviewTable, type FunctionOption } from "./review-table";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { org } = await searchParams;
  const vocab = loadVocab();
  const rows = await loadReviewQueue();
  const functions: FunctionOption[] = classifySlugs(vocab).flatMap((slug) => {
    const fn = vocab.functions.find((f) => f.slug === slug);
    if (!fn) return [];
    return [{ slug, label: fn.label, scope: fn.scope }];
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Function review</h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-600">
            Matcher-unknown affiliations with no human decision. Classify uses
            existing slugs only. Ignore hides the row from the chart. Remain
            unknown is a valid outcome.
          </p>
        </div>
        <Link href="/review/done" className="text-sm underline">
          Reviewed
        </Link>
      </div>

      <ReviewTable
        rows={rows}
        functions={functions}
        initialOrg={org?.trim() ?? ""}
      />
    </div>
  );
}
