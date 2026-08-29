ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "exclude_ownership" boolean NOT NULL DEFAULT false;
