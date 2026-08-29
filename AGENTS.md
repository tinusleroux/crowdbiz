# AGENTS.md — how to work in this repo

CrowdBiz Graph is a living map of the crowd-business side of professional sports: who sits where, how organizations are structured, and how a personal network reaches into them.

**Current state: one producer built, platform not started.** [`crowdbiz_seeding/`](crowdbiz_seeding/) collects public profile data one organization at a time and emits validated claim batches; it lives here under [ADR-0015](docs/decisions/0015-producers-live-here.md). Nothing consumes those batches yet — the claim schema and the batch importer do not exist.

The datastore is decided — Postgres in three zones ([ADR-0009](docs/decisions/0009-stack-and-datastore.md)) — with the schema sketched non-bindingly in [docs/architecture/data-model.md](docs/architecture/data-model.md). The web framework is deliberately not decided, because it is cheap to reverse.

The function and seniority vocabularies live in [ontology/](ontology/) as versioned data. They are not code and must not be reimplemented as constants — read them.

---

## Read this first

1. [docs/README.md](docs/README.md) — authority model and how documents change
2. [docs/product/vision.md](docs/product/vision.md) — what we are building and why
3. [docs/architecture/ontology-core.md](docs/architecture/ontology-core.md) — the object model
4. [docs/decisions/README.md](docs/decisions/README.md) — every binding decision

[docs/glossary.md](docs/glossary.md) defines the vocabulary. Use those words exactly.

---

## Authority order

When sources disagree, higher wins:

1. **Accepted ADRs** in [docs/decisions/](docs/decisions/) — binding; the most recent accepted ADR wins
2. **Canonical docs** — `docs/product/`, `docs/architecture/`, `docs/contracts/`
3. **Open questions** — [docs/open-questions.md](docs/open-questions.md); explicitly *not* binding
4. **Brainstorm archive** — [docs/brainstorm/](docs/brainstorm/); frozen history, never truth

If a canonical doc contradicts an accepted ADR, the ADR wins **and** the doc is wrong. Fix it in the same change.

---

## Hard guardrails

These are settled. Do not relitigate them inside a feature; open an ADR instead.

- **No PII.** No email, phone, or personal contact channels — not even for matching. If a feature needs PII, the feature is wrong. ([ADR-0004](docs/decisions/0004-no-pii.md))
- **Claims in, ontology after.** Producers assert sourced facts. `function` and `seniority` are derived here, after resolve. Never ingest them as truth. ([ADR-0002](docs/decisions/0002-claims-before-interpretation.md))
- **Producers may live here; the claim contract is the only write path.** Collectors are permitted, but nothing reaches the claim zone except through validated, fully-provenanced claims — enforced by schema and grants, not by convention. ([ADR-0015](docs/decisions/0015-producers-live-here.md), superseding ADR-0003)
- **No `Role`, `Job`, `Seat`, or `Department` entities.** `function` on an affiliation is the department-like vocabulary; seats and department nodes are projections. ([ADR-0006](docs/decisions/0006-no-role-seat-department-entities.md))
- **`KNOWS` never defines org structure.** The social overlay is consent-scoped and separate. ([ADR-0008](docs/decisions/0008-knows-overlay-separate.md))
- **Reporting hangs on affiliations, not people.** ([ADR-0001](docs/decisions/0001-core-object-model.md))
- **The derived zone must rebuild from claims alone.** Nothing may live only in derived tables. ([ADR-0009](docs/decisions/0009-stack-and-datastore.md))
- **Person UIDs are stable across re-clustering**, and human identity judgments are claims, not one-off merges. ([ADR-0012](docs/decisions/0012-identity-survives-reclustering.md))
- **On-field roles are out of scope** — classified and filtered, never rejected at ingest, and scoped to the affiliation rather than the person. ([ADR-0013](docs/decisions/0013-on-field-roles-out-of-scope.md))

---

## Vocabulary discipline

The ontology nouns are **Person**, **Organization**, **Affiliation**, **Relationship**. UI copy may say "works at" or "agency of record"; code, schemas, and docs use the ontology nouns.

Do not introduce `role`, `job`, `seat`, or `department` as entities, tables, or types. See [docs/glossary.md](docs/glossary.md) for the banned-word list and what to use instead.

Distinguish carefully:

- **`Affiliation.type`** — *how* someone participates (`employed`, `board`, …)
- **`function`** — *which domain* of crowd-business work
- **`seniority`** — *how senior*, for layout and comparison
- **raw title** — what the source actually said; never overwritten

---

## Making decisions

Route by consequence:

- Changes the **data model**, the **claim contract**, the **product boundary**, or the **stack** → write an ADR in [docs/decisions/](docs/decisions/) using [_template.md](docs/decisions/_template.md), and add it to the index.
- Anything smaller and still unresolved → add it to [docs/open-questions.md](docs/open-questions.md). Promote it to an ADR if it grows teeth.

Only ADR what is expensive to reverse. If a choice can be undone in an afternoon, just make it.

Never encode an undecided thing as a silent default in code or docs. If you must proceed, say so in the open-questions register.

## When a decision is in your way

**ADRs are non-bypassable, not immovable.**

Do not quietly implement something that contradicts an accepted ADR, and do not contort a design to satisfy a decision that implementation has shown to be wrong. Both are failures.

If building reveals that an ADR is wrong, stop and say so. Superseding it is normal — contact with real code is the best reason to change a decision, and it carries no stigma. Write the new ADR, note what the implementation revealed, mark the old one `Superseded`, and carry on.

If an ADR is blocking the obviously right solution, raise it. Do not route around it.

---

## Before you delete or rewrite in bulk

**A statement of intent is not an instruction.** "I think I'm going to drop the ADRs", "we could merge these", "should this move?" — that is someone thinking out loud. Reflect it back and wait. Only an explicit directive authorizes the act, and the gap between the two is where the damage happens.

**Deletion is not an ordinary edit.** Before removing a file, a directory, or a section someone else wrote, say what is about to go and get a yes. Asking costs one message. Being wrong costs someone their work.

**Bulk edits need a stated blast radius.** Any find-and-replace spanning more than one file names its path filter first and excludes `node_modules/`, `.next/`, and `drizzle/meta/`. A regex that rewrites vendored files is a bug, not a side effect.

**Never strip text and leave the sentence standing.** Removing a citation means rewriting the prose around it. `It is permitted here by , which also fixes` is worse than whatever you were tidying.

Git is the backstop, not the plan. Confirm `git status` is clean before a destructive step so the undo exists — but recoverability is not licence to skip the question.

---

## Editing documents

- Every doc carries frontmatter: `status`, `updated`, and (canonical docs) `decided_by`.
- Update `updated` when you change a doc's substance.
- Canonical docs explain and elaborate ADRs. They do not invent binding rules on their own.
- `docs/brainstorm/` is read-only. Do not edit, tidy, or reconcile it.
- Keep facts in one place and link to it. Do not restate a rule in three documents.

---

## Building things

### Layout

```
crowdbiz_seeding/   producer: profile scrape -> validated claim batch  (Next.js, Drizzle, Postgres)
ontology/           function and seniority vocabularies (data, not code)
docs/               decisions, contracts, architecture, product
```

The platform — claim schema, batch importer, resolve, derive, product surfaces — is not built. When it lands it gets its own directory alongside the producer; do not put it inside `crowdbiz_seeding/`.

### Commands

All run from `crowdbiz_seeding/` and need `pnpm`.

```bash
pnpm install
pnpm test          # vitest — includes the claim contract validator
pnpm lint
docker compose up -d db   # local Postgres on 5433
pnpm db:migrate
pnpm db:seed
pnpm worker        # processes queued scrape runs   (terminal 1)
pnpm dev           # operator UI on :3000            (terminal 2)
```

Running a scrape needs `APIFY_TOKEN` in `.env.local` and spends money. `pnpm test` does not.

### Tests that matter more than the rest

Two are not yet written, because the code they test does not exist. They are the acceptance criteria for the import side:

- The derived zone rebuilds from claims alone. Drop `core`, rebuild, and get the same graph.
- A batch re-imports idempotently. Import the same directory twice and the claim count does not change.

A third exists today and must keep passing: a batch carrying `function`, `seniority`, or any contact channel is rejected at emit rather than at import.
