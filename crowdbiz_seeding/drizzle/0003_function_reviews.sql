CREATE TABLE "graph_function_reviews" (
  "affiliation_id" text PRIMARY KEY,
  "org_id" text NOT NULL,
  "person_id" text NOT NULL,
  "raw_title" text NOT NULL,
  "decision" text NOT NULL,
  "function_slug" text,
  "reviewer" text NOT NULL,
  "rationale" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
