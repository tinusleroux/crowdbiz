---
status: archived
updated: 2026-08-29
superseded_by: docs/architecture/ontology-title.md
---

> **Frozen brainstorm.** Not authoritative. Kept for provenance only — see [docs/brainstorm/README.md](README.md).

# CrowdBiz Graph — Title & Structure Ontology Principles

*Draft guide for greenfield architects. Locks principles for normalizing professional titles into comparable structure. Does not prescribe algorithms, models, or storage.*

*Companion:* core objects and edges are defined in `CrowdBiz-Graph-ONTOLOGY-PRINCIPLES.md`. This doc assumes **Affiliation** as the carrier of title, function, and seniority.

---

## Why this exists

Raw job titles are not structure.

The same string can mean different **function**, **rank**, and **decision rights** across teams, leagues, vendors, agencies, and sponsors. Org charts, radial overlays, gap counts (“3 of 6 in Partnerships”), and “who matters here” only work if noisy titles are mapped into a durable internal model.

This document defines **what that model must guarantee**. How you implement matching, inference, or review is open.

---

## Where this sits on the core graph

From the core ontology:

- **Person** / **Organization** / **Affiliation** / **Relationship**
- Title claims belong on **Affiliation** (not on Person or Organization alone)
- **Affiliation.type** (`employed`, `contracted`, `advising`, `board`, `ownership`, `other`) is the participation kind — distinct from function/seniority
- **REPORTS_TO** links Affiliation → Affiliation; structural depth uses that graph

Do not reintroduce separate “role” / “job” / “seat” entities for title normalization. Normalize onto **Affiliation**.

---

## Core distinction

Every affiliation’s title claim must be separable into at least:

1. **Function** — what domain of crowd-business work this affiliation belongs to (e.g. partnerships, ticketing, venue ops). This is the controlled vocabulary used for department-like grouping in product surfaces.
2. **Seniority** — relative rank for layout, comparison, and plausible reporting — **not** a synonym for the title string.
3. **Raw title** — preserved as said/sourced; never discarded or overwritten by the normalized view.

**Affiliation.type** (employed, ownership, …) is separate: it answers *how* the person participates, not *which function* or *how senior*.

**Principle:** the UI and graph queries consume **normalized function + seniority** on affiliations; provenance and display still honor **title as claimed**.

---

## Principles

### 1. Ontology is platform infrastructure

Function labels and seniority ranks are shared product vocabulary — versioned, explainable, and reused everywhere structure appears (org chart, overlay, gaps, assistants).

They are not one-off display hacks and not buried only in prompt text.

### 2. Closed vocabularies over open text

Function should resolve to a **controlled set** of crowd-business categories (exact list is a product decision; stability matters more than elegance).

Seniority should resolve to an **ordered scale** suitable for:

- stacking affiliations in function groups
- radial / hierarchical layout
- cross-org comparison of “how senior”

Unknown or unclassifiable cases need an explicit bucket (e.g. Other / Unknown) — silence is not allowed to look like certainty.

### 3. Titles are claims; normalization is inference

Ingested titles on affiliations remain source-backed claims. A new source (staff directory CSV, press release, correction) is another claim to **resolve**, not a license to overwrite or to skip classification.

Function and seniority are **derived interpretations** with:

- confidence or equivalent uncertainty
- enough traceability to explain *why* (rule hit, pattern family, human confirm, etc.)
- the ability to revise when the ontology or evidence improves — without erasing the raw title

### 4. Preserve raw; project normalized

Never replace the source title with the normalized label in the system of record.

Normalized fields are projections for structure and UX. Users (and auditors) can still see what was written on the site, CSV, or press hit.

### 5. Disambiguation is part of the model

Crowd-business language collides on purpose: *digital*, *development*, *operations*, *experience*, *analytics*, *content*, *sales*.

The ontology must define **how collisions resolve** (priority, context signals, org-type hints). Leaving collisions to “best guess” without policy produces incomparable maps.

### 6. Executives map by oversight, not by the word “Chief”

C-level and “President of X” affiliations should land in the **function they oversee** when that is knowable. A generic “Executive” dump destroys function views and gap analysis.

Where oversight is unclear, prefer Unknown/Other over a confident wrong function.

### 7. Seniority is relative and layout-oriented

The scale exists so structure is computable:

- who sits above whom *within* a plausible org
- who counts as coverage in a senior band
- how rings/layers render

It is **not** a judgment of personal worth, pay, or legal authority. It must be consistent enough for comparison, not metaphysically perfect.

**Recommended orientation (principle, not API):** lower rank number = higher seniority if primary surfaces put leaders at center/top — pick one orientation and keep it product-wide.

### 8. Modifiers adjust rank; they don’t invent a new ontology

Words like senior, junior, assistant, associate, principal, interim, deputy change seniority (and sometimes reporting plausibility). They should not multiply functions or create parallel taxonomies.

Multi-title strings (“VP / Director”) resolve to **one** seniority — typically the highest — and one primary function, with policy for hybrids.

### 9. Validation beats cleverness

Impossible combinations should be rejectable or flaggable (e.g. CEO-level rank in a function that never has one; “assistant” outranking the role it assists).

Prefer failing closed or marking low confidence over emitting a polished wrong org chart.

### 10. Confidence gates automation

High confidence may flow straight into projections. Medium/low confidence should be visible as uncertain and eligible for review or deferred structure — not silently equal to gold.

Assistive models (including LLMs) may propose function/seniority; they do not become the ontology. Structure remains queryable without calling a model at read time.

### 11. Same ontology for teams, vendors, agencies, sponsors

One crowd-business function/seniority system across org types. Organization type may *inform* disambiguation; it must not fork incompatible function lists per org type, or cross-org paths and comparisons break.

### 12. Version the ontology

When categories or seniority rules change, record an ontology version on derived structure (or equivalent). Historical charts should remain interpretable; rebuilds should be intentional.

### 13. Beachhead depth over universal coverage

A sharp, credible function set for the first market slice beats a bloated global HR taxonomy. Expand categories when real titles demand it — not in anticipation of every industry synonym.

### 14. Explainability is user-facing

Wherever seniority or function drives layout or “who matters,” the product should be able to show that this was **inferred**, from what title/evidence, and that raw title remains available. Silent invention undermines trust in the public map.

### 15. Structural depth (“jumps to apex”) is a complementary lens — not the core classifier

Once **REPORTS_TO** structure exists among affiliations, **distance from an org apex** (owner affiliation, controlling ownership, or chief executive affiliation — exact apex policy is a product decision) is a valuable **internal metric**.

It is **not** the primary classification model. Core classification remains: normalize **function** and **title-derived seniority** on each affiliation. Structural depth only becomes meaningful *because* those are standardized; without them, hop counts cannot be compared across functions or interpreted as org shape.

Used **together**, the two signals yield insight the title scale alone cannot:

- **Tension** — title band says senior, depth says far from apex (or the reverse)
- **Flatness** — many affiliations at shallow depth vs a tall ladder of hops
- **Function shape** — same function, different depth profiles across orgs

Treat depth as org-instance topology (per organization, when a path to apex exists). Treat title-derived seniority as interpretation of the title claim. Do not collapse them into a single number early. Prefer depth for internal analysis and as an optional lens on structure; prefer title-derived seniority to bootstrap and to classify when reporting paths are incomplete.

---

## Non-principles (out of scope for this guide)

This guide does **not** lock:

- Regex vs embeddings vs LLM vs human review
- Exact function enumeration or exact scale cardinality
- Database tables, graph labels, or API shapes
- How reporting edges are obtained or how path length is computed
- Exact definition of org apex per org type (must be decided, not prescribed here)

Architects choose methods; they must honor the principles above and the core object model.

---

## Acceptance tests for any implementation

An approach is aligned if:

1. Title normalization is applied on **Affiliation**, consistent with the core ontology.
2. Two different title strings for the same real participation can share function + comparable seniority.
3. Org chart / overlay layout can run on normalized affiliation fields alone.
4. Raw titles remain intact and attributable.
5. A later claim (e.g. a hire in a press extract) is reconciled with existing affiliation claims; it does not bypass resolve or write function/seniority as source truth.
6. Ambiguous titles can be Unknown/low-confidence rather than fake-certain.
7. Ontology changes are versioned and explainable.
8. No feature requires PII to classify function or seniority.
9. Structural depth, when present, is computed along Affiliation **REPORTS_TO** (or equivalent) and used as a lens — not as a substitute for function/seniority classification.
10. Depth and title-derived seniority can disagree without breaking the model (tension is signal, not failure).
11. Affiliation.type is not conflated with function or seniority.

---

## Relationship to other docs

- **Core objects / edges / types:** `CrowdBiz-Graph-ONTOLOGY-PRINCIPLES.md`
- **Product vision:** `CrowdBiz-Graph-VISION.md`

Public professional facts build the map. Affiliations carry participation. Function + seniority make those participations **structurally comparable**. Structural depth then reveals how flat or tall an organization actually is.
