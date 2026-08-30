CREATE TABLE "graph_organizations" (
  "org_id" text PRIMARY KEY,
  "name" text NOT NULL,
  "org_type" text NOT NULL,
  "website" text,
  "source_batch_id" text
);
--> statement-breakpoint
CREATE TABLE "graph_persons" (
  "person_id" text PRIMARY KEY,
  "full_name" text NOT NULL,
  "public_profile_url" text
);
--> statement-breakpoint
CREATE TABLE "graph_affiliations" (
  "affiliation_id" text PRIMARY KEY,
  "person_id" text NOT NULL REFERENCES "graph_persons"("person_id"),
  "org_id" text NOT NULL REFERENCES "graph_organizations"("org_id"),
  "affiliation_type" text NOT NULL,
  "raw_title" text NOT NULL,
  "start_date" text,
  "as_of" text NOT NULL,
  "function_slug" text NOT NULL,
  "seniority_slug" text NOT NULL,
  "in_chart" boolean NOT NULL
);
