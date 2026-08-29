# AGENTS.md — how to work in this repo

CrowdBiz Graph is a living map of the crowd-business side of professional sports: who sits where, how organizations are structured, and how a personal network reaches into them.

**Current state: documentation only, no code yet.** The datastore is decided — Postgres in three zones ([ADR-0009](docs/decisions/0009-stack-and-datastore.md)) — with the schema sketched non-bindingly in [docs/architecture/data-model.md](docs/architecture/data-model.md). The web framework is deliberately not decided, because it is cheap to reverse.

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
- **No collectors in this repo.** No scrapers, crawlers, or research pipelines. The boundary is a batch CSV claim contract. ([ADR-0003](docs/decisions/0003-collection-outside-this-repo.md))
- **No `Role`, `Job`, `Seat`, or `Department` entities.** `function` on an affiliation is the department-like vocabulary; seats and department nodes are projections. ([ADR-0006](docs/decisions/0006-no-role-seat-department-entities.md))
- **`KNOWS` never defines org structure.** The social overlay is consent-scoped and separate. ([ADR-0008](docs/decisions/0008-knows-overlay-separate.md))
- **Reporting hangs on affiliations, not people.** ([ADR-0001](docs/decisions/0001-core-object-model.md))
- **The derived zone must rebuild from claims alone.** Nothing may live only in derived tables. ([ADR-0009](docs/decisions/0009-stack-and-datastore.md))
- **Person UIDs are stable across re-clustering**, and human identity judgments are claims, not one-off merges. ([ADR-0012](docs/decisions/0012-identity-survives-reclustering.md))

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

## Editing documents

- Every doc carries frontmatter: `status`, `updated`, and (canonical docs) `decided_by`.
- Update `updated` when you change a doc's substance.
- Canonical docs explain and elaborate ADRs. They do not invent binding rules on their own.
- `docs/brainstorm/` is read-only. Do not edit, tidy, or reconcile it.
- Keep facts in one place and link to it. Do not restate a rule in three documents.

---

## Building things

No code exists yet, so there are no build, test, or run commands. Add them here as soon as there are, and keep this section current.

When code does start, two tests matter more than the rest: the derived zone rebuilds from claims alone, and a batch re-imports idempotently.
