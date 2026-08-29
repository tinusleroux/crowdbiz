---
status: canonical
updated: 2026-08-29
decided_by: [0001, 0002, 0004, 0006, 0007, 0013, 0014]
---

# Title ontology — function, seniority, and structural depth

How noisy professional titles become comparable structure. This document states what any implementation must guarantee. Matching methods, models, and review workflows are open.

Assumes the object model in [ontology-core.md](ontology-core.md), where **Affiliation** carries title, function, and seniority.

---

## Why this exists

Raw job titles are not structure.

The same string means different function, rank, and decision rights across teams, leagues, vendors, agencies, and sponsors. Org charts, radial overlays, gap counts, and any answer to "who matters here" only work if titles are mapped into a durable internal model.

Without it, everything downstream is guesswork dressed as a chart.

---

## The core distinction

Every title claim separates into at least three things:

1. **Function** — which domain of crowd-business work this affiliation belongs to, such as partnerships, ticketing, or venue operations. This is the controlled vocabulary used for department-like grouping ([ADR-0006](../decisions/0006-no-role-seat-department-entities.md)).
2. **Seniority** — relative rank for layout, comparison, and plausible reporting. Not a synonym for the title string.
3. **Raw title** — preserved as sourced. Never discarded, never overwritten.

`Affiliation.type` is separate again: it answers how someone participates, not which function or how senior.

The graph and UI consume normalized function and seniority. Provenance and display still honor the title as claimed.

Do not reintroduce separate role, job, or seat entities for normalization. Normalize onto the Affiliation.

---

## Principles

### 1. Ontology is platform infrastructure

Function labels and seniority ranks are shared product vocabulary — versioned, explainable, and reused everywhere structure appears: org chart, overlay, gaps, assistants. They are not display hacks and they do not live only inside prompt text.

### 2. Closed vocabularies over open text

Function resolves to a **controlled set** of crowd-business categories. The exact list is a product decision; stability matters more than elegance.

Seniority resolves to an **ordered scale** usable for stacking affiliations within a function, driving hierarchical or radial layout, and comparing seniority across organizations.

Unknown and unclassifiable cases need an explicit bucket. Silence must never look like certainty.

### 3. Titles are claims; normalization is inference

Ingested titles remain source-backed claims. A new source — staff directory, press release, correction — is another claim to resolve, not a license to overwrite ([ingest.md](ingest.md)).

Function and seniority are derived interpretations carrying confidence, enough traceability to explain why, and the ability to be revised when the ontology or the evidence improves — without erasing the raw title.

### 4. Preserve raw; project normalized

Never replace the source title with the normalized label in the system of record. Normalized fields are projections. A user or auditor can always see what the site, CSV, or press hit actually said.

### 5. Disambiguation is part of the model

Crowd-business language collides on purpose: *digital*, *development*, *operations*, *experience*, *analytics*, *content*, *sales*.

The ontology must define how collisions resolve — priority, context signals, organization-type hints. Leaving collisions to best guess produces incomparable maps.

### 6. Executives map by oversight, not by the word "Chief"

C-level and "President of X" affiliations land in the function they oversee when that is knowable. A generic Executive bucket destroys function views and gap analysis.

Where oversight is unclear, prefer Unknown over a confident wrong function.

### 7. Seniority is relative and layout-oriented

The scale exists so structure is computable: who sits above whom within a plausible organization, who counts as coverage in a senior band, how rings and layers render.

It is not a judgment of personal worth, pay, or legal authority. Consistent enough for comparison beats metaphysically perfect.

Pick one orientation — for example, lower rank number meaning more senior if leaders sit at the center or top — and keep it product-wide.

### 8. Modifiers adjust rank; they do not invent an ontology

Senior, junior, assistant, associate, principal, interim, and deputy change seniority and sometimes reporting plausibility. They must not multiply functions or spawn parallel taxonomies.

Multi-title strings such as "VP / Director" resolve to one seniority, typically the highest, and one primary function.

### 9. Validation beats cleverness

Impossible combinations should be rejectable or flaggable — a chief-level rank in a function that never has one, an "assistant" outranking the role it assists.

Prefer failing closed or marking low confidence over emitting a polished wrong org chart.

Distinguish two things that look similar: an **impossible** combination is a validation failure, while a senior title far from the apex is **two valid lenses disagreeing** (see structural depth below). The first is a defect; the second is signal.

### 10. Confidence gates automation

High confidence may flow straight into projections. Medium and low confidence should be visible as uncertain and eligible for review or deferred structure — never silently equal to gold.

Assistive models, including LLMs, may propose function and seniority. They do not become the ontology. Structure stays queryable without calling a model at read time.

### 11. Scope is classified, not filtered at the door

The function vocabulary carries explicit **out-of-scope** categories for on-field work — playing, coaching, scouting, player personnel, athletic training, equipment, sports science, game-film video.

These are classified like any other function, on the affiliation, and excluded by product surfaces afterwards. They are never rejected at ingest, because scope cannot be judged before interpretation: "Director of Video" is game film or content marketing depending on context, and only the ontology can tell.

The test is purpose — does this role exist to run the on-field competitive product? Roles genuinely on the line, such as player engagement or football communications, go to Unknown rather than a forced call ([ADR-0013](../decisions/0013-on-field-roles-out-of-scope.md)).

Scope attaches to the affiliation, never to the person. A former player who becomes VP of Alumni Relations holds one out-of-scope affiliation and one in-scope one.

### 12. One ontology across organization types

One function and seniority system for teams, vendors, agencies, and sponsors. Organization type may inform disambiguation; it must never fork the vocabulary ([ADR-0007](../decisions/0007-one-ontology-across-org-types.md)).

### 13. Version the ontology

When categories or rules change, record an ontology version on derived structure. Historical charts stay interpretable and rebuilds are intentional.

### 14. Beachhead depth over universal coverage

A sharp, credible function set for the first market slice beats a bloated global HR taxonomy. Expand when real titles demand it, not in anticipation of every synonym.

### 15. Explainability is user-facing

Wherever function or seniority drives layout or "who matters," the product can show that this was inferred, from what evidence, with the raw title still available. Silent invention undermines trust in a public map.

---

## The vocabularies

The principles above are binding. The enumerations that satisfy them are versioned data, not prose in this document:

- **Function** — [../../ontology/functions.v2.yaml](../../ontology/functions.v2.yaml). Twenty-two in-scope crowd-business domains, plus `on_field` as the explicit out-of-scope category ([ADR-0013](../decisions/0013-on-field-roles-out-of-scope.md)) and `unknown` for genuine ambiguity.
- **Seniority** — [../../ontology/seniority.v1.yaml](../../ontology/seniority.v1.yaml). Nine ordered bands, lower meaning more senior, with modifiers adjusting a band rather than creating one ([ADR-0014](../decisions/0014-seniority-scale.md)).

Four things that survived contact with held-out data are worth keeping in view:

**Purpose beats vocabulary when classifying scope.** "Football Outreach Coordinator" is community work; "Director of Football Administration" is not. "Director of Family Engagement" is community; "Director of Player Development/Engagement" is on-field. Any rule keyed on the word rather than the purpose gets both wrong, in opposite directions.

**Modifiers must adjust, not enumerate.** Treating "Assistant Director" as its own entry rather than as `director` shifted one band doubles the vocabulary and still misses the next modifier. This is principle 8 stated operationally. The same care applies in reverse: "executive" is a seniority modifier in "Executive Vice President" and not in "Account Executive", which is an individual contributor.

**A near-miss is worse than an unknown.** v1 filed "Senior Account Manager" under finance because the title contains "account". An unclassified row shows as a gap; a plausible wrong one draws a salesperson into the finance column of an org chart and nobody notices. Prefer `unknown`.

**Coverage gaps follow the source, not the ontology.** The v1 corpus contained almost no building trades or food-service line roles, because profile-sourced data under-represents them — not because clubs lack them. Held-out data supplied both. Expect the vocabulary to look complete in exactly the places the seed source is strong, which is the skew recorded as Q-11.

---

## Structural depth as a second lens

Once `REPORTS_TO` structure exists among affiliations, distance from an organization's apex is a valuable internal metric.

It is **not** the primary classifier. Core classification remains function plus title-derived seniority on each affiliation. Depth only becomes meaningful *because* those are standardized — without them, hop counts cannot be compared across functions or read as org shape.

Used together, the two signals show what neither shows alone:

- **Tension** — the title band says senior but depth says far from the apex, or the reverse
- **Flatness** — many affiliations at shallow depth versus a tall ladder of hops
- **Function shape** — the same function with different depth profiles across organizations

Treat depth as per-organization topology, available when a path to an apex exists. Treat title-derived seniority as interpretation of the title claim. Do not collapse them into one number. Prefer title-derived seniority to bootstrap and to classify when reporting paths are incomplete.

What counts as the apex per organization type is unresolved — see [../open-questions.md](../open-questions.md).

---

## Deliberately not fixed here

- Regex versus embeddings versus LLM versus human review
- Tables, graph labels, or API shapes
- How reporting edges are obtained or path length computed
- The apex definition per organization type

Architects choose methods; they honor the principles above and the core object model.

---

## Acceptance tests

An approach is aligned if:

1. Normalization is applied on Affiliation, consistent with [ontology-core.md](ontology-core.md).
2. Two different title strings for the same real participation can share a function and comparable seniority.
3. Org chart and overlay layout run on normalized affiliation fields alone.
4. Raw titles remain intact and attributable.
5. A later claim, such as a hire in a press extract, is reconciled with existing affiliation claims rather than bypassing resolve or writing function and seniority as source truth.
6. Ambiguous titles can be Unknown or low-confidence rather than fake-certain.
7. Ontology changes are versioned and explainable.
8. No feature requires PII to classify function or seniority ([ADR-0004](../decisions/0004-no-pii.md)).
9. Structural depth, where present, is computed along `REPORTS_TO` and used as a lens, not as a substitute for classification.
10. Depth and title-derived seniority can disagree without breaking the model.
11. `Affiliation.type` is never conflated with function or seniority.
12. On-field affiliations are classified as out-of-scope rather than rejected, and the person remains in the graph.
