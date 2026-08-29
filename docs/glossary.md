---
status: canonical
updated: 2026-08-29
decided_by: [0001, 0002, 0006, 0007, 0008, 0009, 0010, 0012]
---

# Glossary

The vocabulary is exact. Code, schemas, and documents use these words with these meanings. UI copy may be friendlier, but the underlying names do not drift.

---

## Objects

**Person** — a durable human identity, keyed by an internal UID we assign. Technically a **derived cluster** of claims rather than an asserted record, so identity is re-derivable and merges are non-destructive ([ADR-0010](decisions/0010-person-identity-without-pii.md)). Established without contact data ([ADR-0004](decisions/0004-no-pii.md)).

**Organization** — a durable collective: team, venue, vendor, agency, sponsor, league, or association.

**Affiliation** — a person participating in an organization over an interval, under a raw title, with a mandatory type. The carrier of title, function, and seniority. The most important noun in this system.

**Relationship** — a timed commercial or structural link between two organizations. Never used for person-to-organization links.

---

## Edges

**AFFILIATED** — Person to Organization, via an Affiliation.

**REPORTS_TO** — Affiliation to Affiliation. Never person to person.

**RELATES** — Organization to Organization, via a Relationship.

**KNOWS** — Person to Person. Consent-scoped social overlay; never org structure ([ADR-0008](decisions/0008-knows-overlay-separate.md)).

---

## Fields and concepts

**claim** — a sourced, timed assertion from a producer. Immutable. The only way facts enter the map.

**raw title** — the title exactly as the source stated it. Preserved permanently, never overwritten.

**`Affiliation.type`** — *how* a person participates: `employed`, `contracted`, `advising`, `board`, `ownership`, `other`.

**function** — *which domain* of crowd-business work an affiliation belongs to. A controlled vocabulary, shared across all organization types ([ADR-0007](decisions/0007-one-ontology-across-org-types.md)). **Derived, not claimed.** This is also the department-like grouping in v1.

**seniority** — *how senior*, on an ordered scale, for layout and comparison. **Derived, not claimed.** Not a judgment of worth, pay, or legal authority.

**provenance** — source, source type, and observation date attached to a claim. The basis for answering "how do we know this?"

**resolve** — the ingest stage that reconciles a new claim against existing ones: corroborate, refine, supersede, or conflict. Also where person clustering happens.

**identity evidence** — anything that raises or lowers confidence that two claims describe the same human: name forms, organization, interval adjacency, affiliation sequence, public profile URL, corroboration, source type. Evidence is weighted; it is never authority.

**confidence band** — the threshold a resolution must clear for a given surface. Per-surface, not global: a warm path to a named human demands more than grouping someone on a chart.

**self-assertion** — a claim someone makes about themselves. The strongest identity evidence available, and not automatically the strongest evidence about their title. What an account may bind to is open ([ADR-0011](decisions/0011-account-to-person-binding.md)).

**user correction** — a claim submitted by a viewer fixing something on a chart. An ordinary attributed claim, not a privileged edit.

**identity assertion** — a `same_as` or `not_same_as` claim stating that two person references are, or are not, the same human. Usually from a human validator or research agent. Anchors that re-clustering must respect ([ADR-0012](decisions/0012-identity-survives-reclustering.md)).

**redirect** — what a retired person UID becomes after a merge, so prior references still resolve. Retired UIDs are never reused.

**zone** — one of the three physical schema separations: append-only claims, rebuildable derived structure, and consent-scoped overlay ([ADR-0009](decisions/0009-stack-and-datastore.md)).

**interpret** — the ingest stage that derives function and seniority from a resolved affiliation.

**conflict** — a recorded disagreement between claims where neither wins. A first-class state, not an error.

**structural depth** — hops from an affiliation to the organization's apex along `REPORTS_TO`. A secondary lens, never the primary classifier.

**apex** — the top of an organization for depth purposes. Its definition per organization type is unresolved; see [open-questions.md](open-questions.md).

**overlay** — a per-viewer projection of `KNOWS` onto a public org chart: first degree, second degree, or none.

**coverage gap** — people in a function at an organization whom the viewer does not know.

**warm path** — a route through the overlay to someone the viewer does not know directly.

**producer** — anything that emits claims: the seeding project, a news extractor, or the product's own users submitting corrections and self-assertions. Collection from third-party sources lives outside this repository; user-submitted claims are a product surface ([ADR-0003](decisions/0003-collection-outside-this-repo.md)).

---

## Banned words

Do not introduce these as entities, tables, types, or fields.

| Banned | Use instead | Why |
| --- | --- | --- |
| `Role`, `Job` | `Affiliation` | Participation is the thing we observe ([ADR-0001](decisions/0001-core-object-model.md)) |
| `Seat`, `Position` as an entity | `Affiliation`; vacancies are projections | We do not observe empty chairs ([ADR-0006](decisions/0006-no-role-seat-department-entities.md)) |
| `Department` as an entity | `function` | Grouping is inference, not an observed object |
| `Employee` as the general case | `Affiliation` with `type` | Employment is one type among several |
| `Contact`, `email`, `phone` | nothing — out of scope | No PII, ever ([ADR-0004](decisions/0004-no-pii.md)) |
| `connection` for org links | `Relationship` | Person-to-org and org-to-org never share a word |

"Position" and "seat" are fine in prose and UI copy. They must not become schema.
