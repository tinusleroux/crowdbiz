---
status: canonical
updated: 2026-08-29
---

# Decisions

Architecture Decision Records. **Accepted ADRs are binding** — authority level 1, above every other document in this repository. See [../README.md](../README.md) for the full authority model.

An ADR with status `Open` is not binding. It records that a decision is being made, and what the real options and trade-offs are, so that nobody quietly picks one by writing code.

## Index

| ID | Title | Status |
| --- | --- | --- |
| [0001](0001-core-object-model.md) | Person, Organization, Affiliation, and Relationship are the core objects | Accepted |
| [0002](0002-claims-before-interpretation.md) | Producers emit claims; function and seniority are derived after resolve | Accepted |
| [0003](0003-collection-outside-this-repo.md) | Data collection lives outside this repo; the boundary is a batch CSV claim contract | Accepted |
| [0004](0004-no-pii.md) | No PII, including for identity matching | Accepted |
| [0005](0005-org-chart-is-the-product.md) | The public org chart is a first-class product surface, and team-side depth is a launch constraint | Accepted |
| [0006](0006-no-role-seat-department-entities.md) | No Role, Job, Seat, or Department entities in v1 | Accepted |
| [0007](0007-one-ontology-across-org-types.md) | One function and seniority system across all organization types | Accepted |
| [0008](0008-knows-overlay-separate.md) | KNOWS is a consent-scoped overlay and never defines org structure | Accepted |
| [0009](0009-stack-and-datastore.md) | Runtime, hosting, and datastore | **Open** |
| [0010](0010-person-identity-without-pii.md) | Person identity and matching without PII | **Open** |

## Writing one

1. Copy [_template.md](_template.md) to `NNNN-short-slug.md` with the next free number.
2. Write real context and consequences — enough that a reader in a year does not need the conversation that produced it.
3. Add a row above.
4. Update every canonical doc the decision touches, in the same change.

## Changing one

Never rewrite an accepted ADR to mean something else. Write a new ADR that supersedes it, set the old one's status to `Superseded`, and link both directions.

## When something is an ADR

If it changes the **data model**, the **claim contract**, the **product boundary**, or the **stack**, it is an ADR.

Smaller unresolved items belong in [../open-questions.md](../open-questions.md) and are promoted here when they grow teeth.
