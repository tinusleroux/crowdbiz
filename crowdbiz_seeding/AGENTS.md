<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# crowdbiz-seed — a producer, not the platform

Read the repository root [AGENTS.md](../AGENTS.md) first. Everything binding lives there: guardrails, vocabulary discipline, and the ADRs.

This module collects public profile data for one organization at a time and emits a claim batch. It is permitted here by [ADR-0015](../docs/decisions/0015-producers-live-here.md), which also fixes what it may not do.

## What this module must not do

- **Never restate the claim contract.** [claim-schema.md](../docs/contracts/claim-schema.md) and [producer-profile-scrape.md](../docs/contracts/producer-profile-scrape.md) are the authority; `src/emit/validate.ts` is the only implementation of them. No snapshots, no second copy.
- **Never emit `function` or `seniority`.** Interpretation happens after resolve, in the platform ([ADR-0002](../docs/decisions/0002-claims-before-interpretation.md)). The validator rejects those headers.
- **Never collect a contact channel** — no email, phone, or messaging handle, not even for matching ([ADR-0004](../docs/decisions/0004-no-pii.md)). Actor modes are pinned to no-email variants for this reason; changing one is a PII decision, not a config tweak.
- **Never filter by job title at collection.** It decides coverage invisibly and skews every chart drawn from the batch. Scope is decided in curation and by the ontology, after the raw row is stored.
- **Never invent provenance.** If a profile URL did not resolve, emit the company listing URL, which is where the row was actually seen. A synthesised `/in/<opaqueId>` is a source nobody can check.

## Producer tables are pre-claim

`raw_profiles`, `curated_profiles`, `scrape_runs`, and `batches` are collection state. They are never an input to the derived zone — everything downstream rebuilds from claims alone ([ADR-0009](../docs/decisions/0009-stack-and-datastore.md)). Keep raw payloads: re-deriving claims with better curation rules is free, where re-scraping costs money.

## Commands

```bash
pnpm test          # vitest
pnpm db:migrate    # drizzle
pnpm worker        # run processor
pnpm dev           # operator UI
```
