---
status: canonical
updated: 2026-08-29
decided_by: [0003, 0004, 0005, 0008, 0013]
---

# Product vision

## One sentence

CrowdBiz Graph makes the crowd-business side of professional sports legible — who sits where, how organizations are structured, and how your network reaches into them.

## Ambition

Become the default operating surface for everyone who works in the crowd-business ecosystem: teams, vendors, sponsors, agencies, operators.

When it works, people cannot do day-to-day industry work without it. It is the living pulse of the industry — who holds which roles, how organizations connect, where influence and access sit, and how that picture is changing.

This is a network-effect product. Every core mechanic should make sharing improve the map for everyone while staying individually rational and low-friction to join.

---

## The problem

People in team front offices are described as working in "sports." Most of that work has little to do with coaches, players, or the on-field product. It is **crowd business**: managing, operating, and monetizing live crowds — ticketing, stadium operations, game presentation, local sponsorships, merchandise, security, concessions.

That line is enforced, not merely stated: on-field roles are classified as out of scope and excluded from every surface ([ADR-0013](../decisions/0013-on-field-roles-out-of-scope.md)).

Everyone in the ecosystem hits the same two walls:

1. **Wrong mental model** — the work is framed as "sports" rather than crowd business.
2. **Opaque structure** — it is hard to see which departments decide what, who the key people are, and whether you already have a path to them.

No existing product makes that structure legible as industry infrastructure.

---

## What the product is

A living map of the crowd-business ecosystem: who works where, how organizations are structured, how they relate commercially, and how personal networks sit on top of that structure.

It models people and organizations, participation over time, department-like structure and reporting, commercial relationships, change, and consent-scoped network overlays. The object model is specified in [../architecture/ontology-core.md](../architecture/ontology-core.md).

Users navigate **structure**. A public org chart is the base view; a personal network is an overlay on it — not a directory of profiles.

### What it is not

- Not a CRM, a messaging app, or a contact database
- Not "LinkedIn with sports filters" — LinkedIn is general-purpose and PII-heavy; this is industry infrastructure optimized for structure, access paths, and the collective currency of the map
- Not a data-collection product — producers exist to feed the map, and only ever through the claim contract ([ADR-0015](../decisions/0015-producers-live-here.md))

---

## The three bets

### 1. No PII is the growth engine

Most professional networks grow by collecting emails and phones. That creates friction, fear, and compliance weight.

We deliberately do not collect or expose personal contact details. What travels are professional facts and relationship context. Contributing feels like adding to an industry map rather than surrendering an address book, which is what makes low-friction adoption possible.

Binding form: [ADR-0004](../decisions/0004-no-pii.md).

### 2. The org chart is the rare asset

A credible org chart of a team or vendor, built from public professional facts, does not exist anywhere in this industry. That capability is the product, not a step toward one.

Overlays, coverage gaps, and warm paths are projections on that chart. Which means a comprehensive **team-side** map is a launch constraint, not a backlog item.

Binding form: [ADR-0005](../decisions/0005-org-chart-is-the-product.md).

### 3. Structure makes the map intelligible — to people and to models

The industry is a graph: people, participation, organizations, vendors, sponsors, time. Stored as navigable structure, traversal and explanation are natural for both the UI and for assistants that walk, cite, and summarize it.

Prefer explicit entities and edges over blob text. Assistants query and explain the graph; they do not substitute for it.

---

## Who it is for

Everyone in the ecosystem, as daily infrastructure. The same map, different daily jobs:

| Side | Day-to-day pull |
| --- | --- |
| **Teams** | Who is in which seat on our side and theirs; the vendor and partner landscape; who moved |
| **Vendors / agencies** | Who decides, where I have coverage, who can warm-intro me |
| **Sponsors** | Who owns the relationship at the team; agency versus in-house paths; continuity when people change |

Vendors and agencies have the sharpest pain around structure and warm access, so they shape which payoff we lead with. They do not shape what gets seeded — see [ADR-0005](../decisions/0005-org-chart-is-the-product.md).

---

## Core user value

From public facts alone, a user opens an organization and sees a real org chart: structure, functions, seniority.

After uploading a connections export, the same chart answers more:

- Where do people I know sit?
- Where are my coverage gaps? ("I know 3 of 6 in Dolphins partnerships — who are the other 3?")
- What are my warm paths in?

News and change keep the map current so it becomes a living pulse rather than a snapshot.

---

## How the map compounds

1. **Claims in** — producers emit sourced assertions; seed batches first, later the same contract from other sources
2. **Resolve** — claims are validated and reconciled against what is known, with history
3. **Interpret** — the ontology derives function and seniority
4. **Org charts** — the map becomes navigable industry structure
5. **Network uploads** — improve public coverage and add consent-scoped social context

Pipeline detail: [../architecture/ingest.md](../architecture/ingest.md).

Each participant's selfish win improves the shared map. No PII keeps the cost of joining low. Structure keeps the asset legible to the product and to future intelligence layers.

---

## Trust without PII

No PII does not mean anything goes. The map is trustworthy because of process and model, not because we hold identities.

- **Claims carry provenance** — the UI can explain why we believe an affiliation or relationship
- **Time is part of truth** — prefer "as of when" over silent forever-facts
- **No silent overwrite** — conflicts resolve through rules and history
- **Inference is labeled** — derived function and seniority are visible as inference
- **Users control their contribution** — visibility can change; contributions can be revoked ([ADR-0008](../decisions/0008-knows-overlay-separate.md))

When someone asks how we know something is true, the answer is provenance, recency, and corroboration.

---

## MVP shape

1. **Batch import** — claim CSVs in; validate, resolve, interpret. Operational, not a consumer surface.
2. **Org chart** — public structure for a real organization. The foundational consumer surface.
3. **Upload** — network in, clear progress out.
4. **Overlay** — the same chart with first degree, second degree, and none encoded. Gaps and warm paths fall out of chart plus overlay.
5. **Privacy** — one visibility setting, not a consent product.

Intelligence features read the graph and the ontology. They do not bypass them.

### Non-goals for v1

- Messaging, inboxes, or outreach channels
- CRM pipelines, deal stages, or activity tracking
- Any personal contact data
- Multi-tenant enterprise administration, SSO fleets, or billing complexity
- Open-ended collection — one specified seeding producer, not a research capability ([ADR-0015](../decisions/0015-producers-live-here.md))
- Perfect global person deduplication or exhaustive worldwide coverage
- A consent ceremony product — one visibility control is enough

If a request expands past ingest, org structure, overlay, and gap or warm path, it waits.

---

## What success looks like

Seed claim batches for a beachhead import, resolve against each other, and interpret cleanly.

A new user opens a real team and a real vendor and sees a credible org chart — structure and seniority that hold up without demo caveats.

If they upload a network, they leave with a concrete coverage gap or a warm path on that same chart.

The strategic test is whether it feels like the start of industry infrastructure: a living map nobody else can produce.
