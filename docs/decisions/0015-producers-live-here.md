---
id: 0015
title: Producers live in this repository; the claim contract stays the only write path
status: Accepted
date: 2026-08-29
supersedes: 0003
superseded_by: null
revisit_when: Collector maintenance starts causing product incidents, or a third-party producer needs to emit without access to this repository
---

# ADR-0015 — Producers live in this repository; the claim contract stays the only write path

## Status

`Accepted` — supersedes [ADR-0003](0003-collection-outside-this-repo.md).

## Context

[ADR-0003](0003-collection-outside-this-repo.md) kept collection out of this repository. Its argument was not about architecture but about attention: a previous build stalled because scraping, research, and editorial curation are open-ended and site-specific, and they dragged the product into crawler maintenance before the graph worked at all.

That condition has changed. The pipeline is now narrow and specified rather than open-ended — one collection method against one source, with a curation pass and a validated emit, described in [contracts/producer-profile-scrape.md](../contracts/producer-profile-scrape.md). The seeding producer that exists is a few hundred lines with tests, not a research desk.

Against that, the separation was costing real work. Two repositories meant a duplicated claim contract, a duplicated validator, and a snapshot in the producer that could silently drift from the canonical files. Splitting was buying a boundary we were paying for twice and enforcing by hand.

There is also a second producer coming. Press-release extraction is continuous rather than batched, and handing yourself CSV files across a repository boundary is friction with no beneficiary.

## Options

**Keep the split and add tooling** — publish the validator as a package, keep the contract in one place, have the producer depend on it. Rejected: it is real machinery to preserve a boundary whose main remaining justification was a credential in an environment variable, which is not a boundary problem.

**Merge and drop the contract as an internal boundary** — let producers write to the claim zone directly, with whatever shape they find convenient. Rejected outright. The contract is what [ADR-0002](0002-claims-before-interpretation.md) and rebuildability rest on, and it is the one thing here that must not soften.

**Merge but keep the contract, enforced in code rather than by a file boundary.** Chosen.

## Decision

Producers may live in this repository. Scrapers, collectors, curation passes, and the operator surfaces around them are permitted here, as modules with their own dependencies and their own schedule.

**The claim contract remains the only write path into the claim zone.** What changes is what enforces it. A CSV file on disk enforced the contract by being inert; in-process code does not, so the constraint moves into code and into the database:

- Claim tables carry no `function`, `seniority`, or any normalized rank column, so a producer cannot write interpretation even by accident ([ADR-0002](0002-claims-before-interpretation.md)).
- The role a producer uses to reach the claim zone holds `INSERT` only. Append-only stops being a convention and becomes a grant ([ADR-0009](0009-stack-and-datastore.md)).
- Every claim still carries full provenance and passes the same validation, whether it arrives as a file or as rows.
- The batch stays a unit: identified, validated, and accepted or rejected whole, with a manifest.
- A batch must remain serializable. Producers outside this repository stay possible, and a batch you can write out is a batch you can replay.

**Producer failure stays isolated from the product.** Collectors run as scheduled jobs, never in a request path, and ingest never calls one synchronously. A broken scraper means no new batch today, not an incident.

**No PII, still and always.** Proximity to a collector that *can* fetch contact details changes nothing ([ADR-0004](0004-no-pii.md)). Collectors are configured not to request them.

## Consequences

- One contract, one validator, one implementation. The producer finds out it violated the contract at emit time rather than at import time.
- Producer tables — raw capture, curation state, run history — are pre-claim and live in their own schema. They are never an input to the derived zone, or rebuildability quietly dies.
- Raw capture is now worth keeping: re-deriving claims from a stored scrape with better curation rules costs nothing, where re-scraping costs money.
- ADR-0003 accepted "we cannot fix data quality by patching a scraper" as the price of separation. That protection is gone. It is now a discipline: bad input is still fixed at the producer or through a corrections batch, never by mutating a claim.
- The temptation to widen collection is back, and this is the thing to watch. The permission is for producers that satisfy a specified contract — not for an open-ended research capability.
- Dependency weight and credentials now sit in the same tree as the product. Package boundaries contain the first; the second was never the reason for the split.

## Affects

- [contracts/claim-schema.md](../contracts/claim-schema.md)
- [contracts/producer-profile-scrape.md](../contracts/producer-profile-scrape.md)
- [architecture/ingest.md](../architecture/ingest.md)
- [architecture/data-model.md](../architecture/data-model.md)
- [product/vision.md](../product/vision.md)
- [../../AGENTS.md](../../AGENTS.md)

## Source

Discussion, 2026-08-29, on bringing the seeding producer into the workspace after it was built against [contracts/producer-profile-scrape.md](../contracts/producer-profile-scrape.md).
