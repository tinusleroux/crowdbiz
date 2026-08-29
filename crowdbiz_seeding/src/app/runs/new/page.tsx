import { startScrape } from "@/app/actions";
import { db } from "@/db";
import { organizations } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function NewRunPage() {
  const orgs = await db().select().from(organizations);

  return (
    <form action={startScrape} className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">New scrape</h1>
      <p className="text-sm text-zinc-600">
        One organization per job. Employees Short mode only; vanity scrape uses
        Profile details no email.
      </p>
      <label className="block text-sm">
        Organization
        <select
          name="orgRef"
          required
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        >
          {orgs.map((o) => (
            <option key={o.orgRef} value={o.orgRef}>
              {o.displayName} ({o.orgRef})
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        maxItems
        <input
          name="maxItems"
          type="number"
          defaultValue={200}
          min={1}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        USD charge cap (optional)
        <input
          name="chargeCapUsd"
          type="number"
          step="0.01"
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          placeholder="5.00"
        />
      </label>
      <button
        type="submit"
        className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
      >
        Queue scrape
      </button>
    </form>
  );
}
