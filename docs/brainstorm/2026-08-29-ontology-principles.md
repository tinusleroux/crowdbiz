---
status: archived
updated: 2026-08-29
superseded_by: docs/architecture/ontology-core.md
---

> **Frozen brainstorm.** Not authoritative. Kept for provenance only — see [docs/brainstorm/README.md](README.md).

# CrowdBiz Graph — Core Ontology Principles

*Draft. Locks the primary objects, edges, and types for the industry graph. Does not prescribe storage, APIs, or algorithms.*

*Companion:* title / function / seniority principles live in `CrowdBiz-Graph-TITLE-ONTOLOGY-PRINCIPLES.md`. That doc assumes this object model.

---

## Objects

| Object | Meaning |
| --- | --- |
| **Person** | Durable human identity |
| **Organization** | Durable collective (team, vendor, agency, sponsor, league, venue, trade association, …) |
| **Affiliation** | A person participates in an organization for an interval, under a title, with a mandatory **type**, and with derived **function** / **seniority** when known |
| **Relationship** | A timed commercial (or structural) link between two organizations, with a mandatory **type** |

UI copy may say “works at,” “owner,” “agency of record,” etc. **Affiliation** and **Relationship** are ontology names; they need not be primary product vocabulary.

---

## Claims vs interpretation

What producers send (seed CSV, later a press-release extract, a correction file) are **claims**: sourced, timed assertions.

Typical affiliation claim: this Person, at this Organization, with this **raw title**, this **type**, this **interval** (or as-of), from this **source**. Optional: reporting, department string as a claim.

What this product **derives** after resolve: **function**, **seniority**, structural projections. Those are not claims and must not be the producer’s system of record.

**Example:** a scraper finds a press release that someone accepted a new job. That is one affiliation claim (and often an implied end or split of a prior affiliation). Ingest overlaps it with existing claims: corroborate, supersede, time-slice, or conflict — with history. Then ontology classifies the resulting affiliation’s title. The scraper does not write “Partnerships / VP-band” into the graph.

Identity matching of the Person (without PII) is part of resolve, not part of title ontology.

---

---

## Edges

| Edge | From → To | Meaning |
| --- | --- | --- |
| **AFFILIATED** | Person → Organization | Via an **Affiliation** |
| **REPORTS_TO** | Affiliation → Affiliation | Reporting within an org (time-qualified when known); basis for structural depth (“jumps to apex”) |
| **RELATES** | Organization → Organization | Via a **Relationship** (optional context e.g. on-behalf-of) |
| **KNOWS** | Person → Person | Consent-scoped social overlay — not org structure |

---

## What an Affiliation carries

| Field | Role |
| --- | --- |
| **type** | Mandatory participation kind (`employed`, `contracted`, …) |
| **raw title** | Source-backed claim string — preserved |
| **function** | Controlled crowd-business category — derived (see title ontology doc) |
| **seniority** | Ordered rank scale — derived (see title ontology doc) |
| **time** | Interval of participation |

Function and seniority are **not** properties of Person or Organization alone. They are interpretations of the affiliation’s title (and context).

---

## Affiliation types (Person → Org)

Every affiliation has a type. Employment is one type, not the whole concept.

| Type | Intent |
| --- | --- |
| `employed` | Staff / W-2-style participation (default for org charts & coverage) |
| `contracted` | Contractor / freelance engagement |
| `advising` | Advisor / consultant capacity |
| `board` | Board or similar governance role |
| `ownership` | Owner / principal / controlling interest |
| `other` | Explicit residual — not silent null |

Product surfaces (org chart, gaps, radial) typically weight `employed` and may include `contracted`; apex / structure may use `ownership` and senior `employed`.

---

## Relationship types (Org → Org)

Every relationship has a type. Exact catalog can grow; start sharp.

Illustrative starter set:

| Type | Intent |
| --- | --- |
| `agency_of_record` | Agency retained as AOR for a brand / client |
| `sponsors` | Sponsor ↔ property (e.g. brand sponsors team) |
| `supplies` | Vendor supplies team / venue |
| `engaged_at` | Agency or vendor engaged at a property (often on behalf of a client) |
| `partners_with` | General partnership |
| `other` | Explicit residual |

Relationships may carry optional context (e.g. **on behalf of** organization) without inventing a third core object.

---

## Rules

1. **Affiliation ≠ Relationship** — never use one word for person–org and org–org links.
2. **Type is mandatory** on both Affiliation and Relationship — breadth lives in types, not in overloaded nouns.
3. **Title ontology attaches to Affiliation** — raw title is the claim; function and seniority are derived; see companion title-ontology doc.
4. **Claims before ontology** — ingest stores and reconciles claims; interpretation runs on the resolved affiliation. Producers must not skip resolve by shipping normalized function/seniority as truth.
5. **Reify what you observe; project what you infer** — seats, vacant posts, and department *nodes* are projections unless evidence demands first-class objects later. **Function** on affiliation is the controlled vocabulary for “department-like” structure in v1.
6. **Reporting hangs on Affiliation** — not bare Person-to-Person — so moves and dual posts stay coherent.
7. **KNOWS stays separate** — social overlay does not define org structure.
8. **Structural depth is a lens on REPORTS_TO** — hops toward an org apex complement title-derived seniority; they do not replace function/seniority classification (detail in title-ontology doc).

---

## Related docs

- Product vision: `CrowdBiz-Graph-VISION.md`
- Title / function / seniority / structural depth: `CrowdBiz-Graph-TITLE-ONTOLOGY-PRINCIPLES.md`
