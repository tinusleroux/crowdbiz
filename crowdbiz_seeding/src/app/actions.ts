"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { organizations, scrapeRuns } from "@/db/schema";

export async function createOrganization(formData: FormData) {
  const orgRef = String(formData.get("orgRef") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const orgType = String(formData.get("orgType") ?? "team").trim() || "team";
  const website = String(formData.get("website") ?? "").trim() || null;
  const linkedinCompanyUrl = String(
    formData.get("linkedinCompanyUrl") ?? "",
  ).trim();
  const excludeOwnership = formData.get("excludeOwnership") != null;

  if (!orgRef || !displayName || !linkedinCompanyUrl) {
    throw new Error("org_ref, name, and LinkedIn company URL are required");
  }
  if (!/^https:\/\/www\.linkedin\.com\/company\//.test(linkedinCompanyUrl)) {
    throw new Error("LinkedIn company URL must be a single company page");
  }

  await db().insert(organizations).values({
    orgRef,
    displayName,
    orgType,
    website,
    linkedinCompanyUrl,
    excludeOwnership,
  });
  revalidatePath("/orgs");
  redirect("/orgs");
}

export async function startScrape(formData: FormData) {
  const orgRef = String(formData.get("orgRef") ?? "").trim();
  const maxItems = Number(formData.get("maxItems") ?? 200);
  const capRaw = String(formData.get("chargeCapUsd") ?? "").trim();
  if (!orgRef) throw new Error("Select one organization");

  const [run] = await db()
    .insert(scrapeRuns)
    .values({
      orgRef,
      status: "queued",
      maxItems: Number.isFinite(maxItems) && maxItems > 0 ? maxItems : 200,
      chargeCapUsd: capRaw ? capRaw : null,
    })
    .returning();

  if (!run) throw new Error("Failed to enqueue scrape");
  revalidatePath("/orgs");
  redirect(`/runs/${run.id}`);
}
