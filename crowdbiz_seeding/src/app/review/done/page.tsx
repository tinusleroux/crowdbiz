import Link from "next/link";
import { undoReview } from "../actions";
import { loadFunctionReviews } from "@/graph/review-queue";

export const dynamic = "force-dynamic";

export default async function ReviewedPage() {
  const rows = await loadFunctionReviews();

  return (
    <div className="space-y-5">
      <div>
        <Link href="/review" className="text-sm text-zinc-600 underline">
          Back to queue
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Reviewed</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {rows.length} decision{rows.length === 1 ? "" : "s"}. Undo restores
          matcher output for that affiliation.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No reviews yet.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 text-left text-zinc-600">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Organization</th>
                <th className="px-3 py-2 font-medium">Decision</th>
                <th className="px-3 py-2 font-medium">Reviewer</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ review, orgName, fullName }) => (
                <tr
                  key={review.affiliationId}
                  className="border-b border-zinc-100"
                >
                  <td className="px-3 py-2">{fullName ?? review.personId}</td>
                  <td className="px-3 py-2">{review.rawTitle}</td>
                  <td className="px-3 py-2">{orgName ?? review.orgId}</td>
                  <td className="px-3 py-2">
                    {review.decision === "classify"
                      ? `classify → ${review.functionSlug}`
                      : review.decision}
                  </td>
                  <td className="px-3 py-2">{review.reviewer}</td>
                  <td className="px-3 py-2 text-right">
                    <form action={undoReview.bind(null, review.affiliationId)}>
                      <button type="submit" className="text-xs underline">
                        Undo
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
