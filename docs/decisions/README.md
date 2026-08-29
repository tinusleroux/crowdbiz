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
| [0009](0009-stack-and-datastore.md) | Postgres is the system of record, in three physically separated zones | Accepted |
| [0010](0010-person-identity-without-pii.md) | Person identity is a derived cluster over claims, resolved probabilistically | Accepted |
| [0011](0011-account-to-person-binding.md) | Account-to-person binding — self-claiming and what it entitles | **Open** |
| [0012](0012-identity-survives-reclustering.md) | Identity survives re-clustering — stable UIDs and identity assertions as claims | Accepted |
| [0013](0013-on-field-roles-out-of-scope.md) | On-field roles are out of scope — classified, not rejected | Accepted |
| [0014](0014-seniority-scale.md) | Seniority is a nine-band ordered scale where lower is more senior | Accepted |

## Writing one

1. Copy [_template.md](_template.md) to `NNNN-short-slug.md` with the next free number.
2. Write real context and consequences — enough that a reader in a year does not need the conversation that produced it.
3. Add a row above.
4. Update every canonical doc the decision touches, in the same change.

## Changing one

**ADRs are non-bypassable, not immovable.** Never quietly build something that contradicts an accepted ADR — but changing one is normal, and discovering during implementation that a decision was wrong is the best reason there is.

Write a new ADR that supersedes it, set the old one's status to `Superseded`, and link both directions. Never rewrite an accepted ADR to mean something else. A scope clarification that does not change the decision may be added inline, dated and labelled as such.

If an ADR is blocking the obviously right solution, re-open it rather than working around it. Full guidance in [../README.md](../README.md).

## When something is an ADR

If it changes the **data model**, the **claim contract**, the **product boundary**, or the **stack**, it is an ADR.

Only ADR what is expensive to reverse. If a choice can be undone in an afternoon, just make it — ceremony over cheap decisions buries the ones that matter.

Smaller unresolved items belong in [../open-questions.md](../open-questions.md) and are promoted here when they grow teeth.
