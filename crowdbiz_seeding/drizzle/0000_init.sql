CREATE TABLE "organizations" (
  "org_ref" text PRIMARY KEY,
  "display_name" text NOT NULL,
  "org_type" text NOT NULL DEFAULT 'team',
  "website" text,
  "linkedin_company_url" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scrape_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "org_ref" text NOT NULL REFERENCES "organizations"("org_ref"),
  "status" text NOT NULL DEFAULT 'queued',
  "apify_employees_run_id" text,
  "apify_vanity_run_id" text,
  "apify_employees_actor" text,
  "apify_vanity_actor" text,
  "apify_employees_build" text,
  "apify_vanity_build" text,
  "observed_at" timestamptz,
  "max_items" integer NOT NULL DEFAULT 200,
  "charge_cap_usd" numeric(10, 2),
  "error_text" text,
  "collected" integer NOT NULL DEFAULT 0,
  "emitted" integer NOT NULL DEFAULT 0,
  "curated_out" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "raw_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "scrape_run_id" uuid NOT NULL REFERENCES "scrape_runs"("id"),
  "opaque_id" text NOT NULL,
  "first_name" text,
  "last_name" text,
  "title" text,
  "company" text,
  "start_year" integer,
  "start_month" integer,
  "member_url" text,
  "dataset_item_id" text,
  "payload" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "raw_profiles_run_opaque" ON "raw_profiles" ("scrape_run_id", "opaque_id");
--> statement-breakpoint
CREATE TABLE "curated_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "scrape_run_id" uuid NOT NULL REFERENCES "scrape_runs"("id"),
  "raw_profile_id" uuid NOT NULL REFERENCES "raw_profiles"("id"),
  "outcome" text NOT NULL,
  "drop_reason" text,
  "full_name" text NOT NULL,
  "raw_title" text NOT NULL,
  "person_ref" text NOT NULL,
  "vanity_url" text,
  "start_date" text,
  "affiliation_type" text NOT NULL DEFAULT 'employed',
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "batches" (
  "batch_id" text PRIMARY KEY,
  "scrape_run_id" uuid NOT NULL REFERENCES "scrape_runs"("id"),
  "filesystem_path" text NOT NULL,
  "generated_at" timestamptz NOT NULL,
  "manifest" jsonb NOT NULL,
  "validation_ok" boolean NOT NULL,
  "validation_errors" jsonb
);
