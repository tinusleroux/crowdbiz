import { createOrganization } from "@/app/actions";

export default function NewOrgPage() {
  return (
    <form action={createOrganization} className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Add organization</h1>
      <label className="block text-sm">
        org_ref (stable)
        <input
          name="orgRef"
          required
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm"
          placeholder="nfl-green-bay-packers"
        />
      </label>
      <label className="block text-sm">
        Display name
        <input
          name="displayName"
          required
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        org_type
        <input
          name="orgType"
          defaultValue="team"
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Website (optional)
        <input
          name="website"
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          placeholder="https://www.packers.com"
        />
      </label>
      <label className="block text-sm">
        LinkedIn company URL (exactly one)
        <input
          name="linkedinCompanyUrl"
          required
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm"
          placeholder="https://www.linkedin.com/company/32984"
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="excludeOwnership"
          value="on"
          className="mt-1"
        />
        <span>
          Exclude owners and shareholders at collection
          <span className="mt-0.5 block text-xs text-zinc-500">
            For publicly-owned clubs only, where thousands of fans hold a share
            and list it. Leave off for vendors and agencies — it would drop the
            founders.
          </span>
        </span>
      </label>
      <button
        type="submit"
        className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
      >
        Save
      </button>
    </form>
  );
}
