import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  orgRef: text("org_ref").primaryKey(),
  displayName: text("display_name").notNull(),
  orgType: text("org_type").notNull().default("team"),
  website: text("website"),
  linkedinCompanyUrl: text("linkedin_company_url").notNull(),
  /** Publicly-owned clubs only, where fans hold shares and list them. */
  excludeOwnership: boolean("exclude_ownership").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const scrapeRuns = pgTable("scrape_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgRef: text("org_ref")
    .notNull()
    .references(() => organizations.orgRef),
  status: text("status").notNull().default("queued"),
  apifyEmployeesRunId: text("apify_employees_run_id"),
  apifyVanityRunId: text("apify_vanity_run_id"),
  apifyEmployeesActor: text("apify_employees_actor"),
  apifyVanityActor: text("apify_vanity_actor"),
  apifyEmployeesBuild: text("apify_employees_build"),
  apifyVanityBuild: text("apify_vanity_build"),
  observedAt: timestamp("observed_at", { withTimezone: true }),
  maxItems: integer("max_items").notNull().default(200),
  chargeCapUsd: numeric("charge_cap_usd", { precision: 10, scale: 2 }),
  errorText: text("error_text"),
  collected: integer("collected").notNull().default(0),
  emitted: integer("emitted").notNull().default(0),
  curatedOut: integer("curated_out").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rawProfiles = pgTable(
  "raw_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scrapeRunId: uuid("scrape_run_id")
      .notNull()
      .references(() => scrapeRuns.id),
    opaqueId: text("opaque_id").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    title: text("title"),
    company: text("company"),
    startYear: integer("start_year"),
    startMonth: integer("start_month"),
    memberUrl: text("member_url"),
    datasetItemId: text("dataset_item_id"),
    /** Public LinkedIn About text, fetched during keeper profile enrichment. */
    profileAbout: text("profile_about"),
    payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("raw_profiles_run_opaque").on(t.scrapeRunId, t.opaqueId)],
);

export const curatedProfiles = pgTable("curated_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  scrapeRunId: uuid("scrape_run_id")
    .notNull()
    .references(() => scrapeRuns.id),
  rawProfileId: uuid("raw_profile_id")
    .notNull()
    .references(() => rawProfiles.id),
  outcome: text("outcome").notNull(),
  dropReason: text("drop_reason"),
  fullName: text("full_name").notNull(),
  rawTitle: text("raw_title").notNull(),
  personRef: text("person_ref").notNull(),
  vanityUrl: text("vanity_url"),
  startDate: text("start_date"),
  affiliationType: text("affiliation_type").notNull().default("employed"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Derived graph — rebuilt from claim batches, not producer tables. */
export const graphOrganizations = pgTable("graph_organizations", {
  orgId: text("org_id").primaryKey(),
  name: text("name").notNull(),
  orgType: text("org_type").notNull(),
  website: text("website"),
  sourceBatchId: text("source_batch_id"),
});

export const graphPersons = pgTable("graph_persons", {
  personId: text("person_id").primaryKey(),
  fullName: text("full_name").notNull(),
  publicProfileUrl: text("public_profile_url"),
});

export const graphAffiliations = pgTable("graph_affiliations", {
  affiliationId: text("affiliation_id").primaryKey(),
  personId: text("person_id")
    .notNull()
    .references(() => graphPersons.personId),
  orgId: text("org_id")
    .notNull()
    .references(() => graphOrganizations.orgId),
  affiliationType: text("affiliation_type").notNull(),
  rawTitle: text("raw_title").notNull(),
  startDate: text("start_date"),
  asOf: text("as_of").notNull(),
  functionSlug: text("function_slug").notNull(),
  senioritySlug: text("seniority_slug").notNull(),
  inChart: boolean("in_chart").notNull(),
});

/**
 * Human function decisions. Upserted by affiliation claim id. Not a claim
 * column, and not FK'd to graph_affiliations — reimport deletes those rows.
 */
export const graphFunctionReviews = pgTable("graph_function_reviews", {
  affiliationId: text("affiliation_id").primaryKey(),
  orgId: text("org_id").notNull(),
  personId: text("person_id").notNull(),
  rawTitle: text("raw_title").notNull(),
  decision: text("decision").notNull(),
  functionSlug: text("function_slug"),
  reviewer: text("reviewer").notNull(),
  rationale: text("rationale"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const batches = pgTable("batches", {
  batchId: text("batch_id").primaryKey(),
  scrapeRunId: uuid("scrape_run_id")
    .notNull()
    .references(() => scrapeRuns.id),
  filesystemPath: text("filesystem_path").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
  manifest: jsonb("manifest").notNull().$type<Record<string, unknown>>(),
  validationOk: boolean("validation_ok").notNull(),
  validationErrors: jsonb("validation_errors").$type<string[] | null>(),
});
