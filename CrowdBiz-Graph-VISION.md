# CrowdBiz Graph — Product Vision

*Product brief for a greenfield build. Capture intent and strategic design drivers — not a build log.*

---

## Ambition

Become the default operating surface for anyone who works in the crowd-business ecosystem — teams, vendors, sponsors, agencies, operators.

When it works, people feel they cannot really do day-to-day industry work without it. It is the **living pulse of the industry**: who holds which roles, how organizations connect, where influence and access sit, and how that picture is changing.

That is a network-effect product. Design every core mechanic so sharing improves the map for everyone while remaining individually rational and low-friction to join.

---

## One sentence

CrowdBiz Graph makes the crowd-business side of sports legible — who sits where, how orgs are structured, how your network reaches in.

---

## Mantra

> Public professional facts build the map.  
> Ontology makes structure comparable.  
> Private social edges add context.  
> Projections make it usable.

---

## Strategic unlocks (design drivers)

These are the unusual bets. They should shape product, data model, and UX — not sit as footnotes.

### 1. We do not seek PII — and that is the growth engine

Counter-intuitive, and decisive.

Most professional networks grow by collecting emails, phones, and private identity baggage. That creates friction, fear, compliance weight, and slow adoption.

CrowdBiz Graph deliberately **does not collect or expose personal contact details**. What travels are professional facts and relationship *context*: names, titles, organizations, roles, and (where allowed) connection topology.

That is what makes wildfire adoption possible: contributing feels like adding to an industry map, not surrendering an address book.

**Design implication:** never let features creep toward “we’ll just store email for matching.” Identity and matching must work without PII as a crutch. If a feature needs PII to work, rethink the feature.

### 2. Sharing your network has a clear personal payoff — without sharing PII

People upload because **they get something immediately**:

- See where they fit in the ecosystem
- See coverage gaps in target orgs
- See warm paths to people they do not know yet

What they contribute is mostly **context and metadata** (who sits where; who is connected in a professional sense), not private contact channels. Self-interest and map quality reinforce each other.

**Design implication:** the first session after upload must deliver that payoff (gap + warm path on a real org). Viral loops fail if sharing is altruism-only.

### 3. Graph structure unlocks intelligence — especially with LLMs

The industry is a graph: people ↔ roles ↔ orgs ↔ vendors ↔ sponsors ↔ time.

Storing it as a navigable graph (not only tables or documents) makes traversal, pathfinding, and explanation natural for both UI and models. LLMs become powerful when the substrate is structured relationships they can walk, cite, and summarize — “who matters in this department,” “what changed,” “how do I get to this role from my network.”

**Design implication:** prefer explicit entities and edges over blob text. Build so assistants query and explain the graph; do not treat the LLM as a substitute for structure.

### 4. An internal ontology makes seniority and structure computable

Titles are not seniority. The same string means different rank, function, and decision rights across teams, leagues, and vendors.

A durable internal ontology is what lets the product:

- Normalize noisy titles into role types and functions (ticketing, partnerships, ops, and so on)
- Infer **relative seniority** and plausible reporting inside an organization
- Compare structure across orgs that do not share a vocabulary

Without it, org charts, “who matters in this department,” gap counts, and radial overlays are guesswork. With it, public facts become a comparable map.

**Design implication:** ontology is platform infrastructure — versioned, explainable, and used everywhere structure is shown or queried. Do not treat title strings as the model of rank.

### 5. Public org charts are a foundational capability — and they do not exist elsewhere

Producing a credible org chart of **teams and vendors** from publicly available professional facts is itself powerful and rare. That ability is a core product of the platform, not scaffolding for a later overlay.

Network overlays, coverage gaps, and warm paths are projections **on** that chart. They do not replace it.

**Design implication:** design org-chart generation as a first-class, durable surface and data product — temporal, provenance-backed, ontology-ranked, and reusable. Do not treat it as a throwaway step on the way to something else.

### 6. Seeding collection is a separate project — this product ingests batches

Team-side depth is still a day-1 requirement. Collecting that data is **not** this product’s job.

CrowdBiz Graph designs for **batch import of CSV files with a specified schema**, then a disciplined pipeline:

1. **Validate** — required fields, types, referential integrity, no PII in the file
2. **Normalize** — identity, titles, orgs, and roles through the ontology
3. **Resolve conflicts** — provenance, recency, and history; never last-write-wins amnesia

A separate seeding project owns scraping, research, curation, and **producing those CSVs**. This project owns the contract (fields, constraints, provenance columns) and the ingest process that turns a batch into graph claims.

**Design implication:** do not build collectors, crawlers, or editorial workflows here. Specify the CSV contract clearly enough that the seeding project can ship files independently — and that re-imports, corrections, and new beachheads are the same path.

---

## The problem

People who work in team front offices are usually described as being in “sports.” In practice, much of that work has little to do with coaches, players, or the on-field product. It is **crowd business**: managing, operating, and monetizing live crowds — ticketing, stadium operations, game presentation, local sponsorships, merchandise, security, concessions, and related functions.

Everyone in the ecosystem faces two persistent problems:

1. **Wrong mental model** — framed as “sports” rather than crowd business.
2. **Opaque structure** — hard to see which departments decide what, who the key people are, and whether you already have a path to them.

No existing product makes that structure legible as industry infrastructure.

---

## What the product is

A **living map of the crowd-business ecosystem** — the pulse of who works where, how organizations are structured, how they relate, and how personal networks sit on top of that structure.

It models:

- People and organizations (teams, venues, vendors, agencies, sponsors, leagues)
- Roles and positions
- Departmental / reporting structure (ontology-ranked, not title-literal)
- Partnerships and vendor relationships
- Change over time
- Personal network overlays (consent-scoped)

Users navigate **positions and structures**. A public org chart is the base view. A personal network is an overlay — not a static directory of profiles.

### What it is not

- Not a CRM
- Not a messaging app
- Not a contact database
- Not “LinkedIn with sports filters” — LinkedIn is general-purpose and PII-heavy; this is industry infrastructure for crowd business, optimized for structure, access paths, and collective currency of the map
- Not a data-collection or scraping product — seed files are produced elsewhere and imported here

---

## Who it is for

**Everyone in the ecosystem** — teams, vendors, sponsors, agencies — as daily industry infrastructure.

This is not a “vendors first, teams later” product. The same map serves every side. What differs is the daily job:

| Side | Day-to-day pull |
| --- | --- |
| **Teams** | Who’s in which seat on our side and theirs; vendor / partner landscape; who moved |
| **Vendors / agencies** | Who decides, where I have coverage, who can warm-intro me |
| **Sponsors** | Who owns the relationship at the team; agency vs in-house paths; continuity when people change |

Vendors and agencies have sharp pain around structure and warm access. That can shape *how* the overlay pays off. It must not shape *what gets seeded*. Day 1 has to feel already comprehensive on the **team side** of the map, or nothing else lands.

---

## Foundational work: a team-side skeleton on day 1

The map only works if a **credible public skeleton of team organizations** is already loaded — people, roles, departments, seniority — deep enough that an org chart feels true on day 1.

Network upload, gaps, and warm paths fail if a team page is empty or wrong. Prefer depth (a league’s teams, well structured) over thin coverage everywhere. Vendor and agency charts use the same org-chart capability; team-side completeness is what makes the map feel real.

**Split of labor:**

| Project | Owns |
| --- | --- |
| **Seeding project** | Collecting and curating public professional facts; emitting CSVs that match this product’s import contract |
| **CrowdBiz Graph** | The CSV schema; batch import; validation, normalization, and conflict resolution; the living graph and org-chart product |

Beachhead *coverage* is a joint launch constraint. Beachhead *collection* is not in this repo.

---

## Core user value

From public facts alone, a user can open an organization and see a real org chart: structure, functions, seniority.

After uploading a connections export, they can also answer:

- Where do people I know sit?
- Where are my **coverage gaps**? (“I know 3 of 6 in Dolphins partnerships — who are the other 3?”)
- What are my **warm paths** in?

News and deal-flow keep the same map current so it becomes the living pulse, not a one-time snapshot.

---

## How the map compounds

1. **Seed CSVs** — a separate project produces batch files (team-side depth first).
2. **Ingest** — this product validates, normalizes (ontology), and resolves conflicts into graph claims with provenance.
3. **Org charts** — the map becomes navigable as industry structure (teams and vendors).
4. **Network uploads** — improve public professional coverage *and* add consent-scoped social context for the uploader’s views (and, per visibility rules, permitted overlays).
5. **News and change** — later; keep the pulse alive without turning this product into a crawl factory.

Each participant’s selfish win (see structure / my fit / gaps / paths) improves the shared professional map. No PII requirement keeps the cost of joining low. Graph form plus ontology keep the asset legible to product and to future intelligence layers.

---

## Trust without PII

No PII does not mean “anything goes.” The map stays trustworthy because of process and model, not because we hold emails.

Principles:

- **Claims with provenance** — assertions are attributed to sources; the UI can explain *why* we believe a role or edge.
- **Time is part of truth** — people move; prefer “as of when” over silent forever-facts.
- **No silent overwrite** — conflicts are resolved with rules and history, not last-write-wins amnesia.
- **Inferred structure is explainable** — seniority and reporting deduced via ontology should be visible as inference, with the same provenance/recency discipline as asserted facts.
- **User control of contribution** — visibility can change; a user can revoke or remove their network contribution.
- **Professional facts ≠ private channels** — names/titles/orgs may be shared map material; contact channels stay out.

**Design implication:** when someone asks “how do we know it’s true?”, the answer is provenance + recency + corroboration — never “we verified via personal email.”

---

## Product surfaces (MVP shape)

Keep the first shippable surface small and aligned to the ambition:

1. **Batch import** — specified CSVs in; validation, normalization, and conflict resolution out as graph claims. (Operational, not a consumer surface.)
2. **Org chart** — public structure for a real org (team or vendor): departments, people, seniority. This is the foundational consumer surface.
3. **Upload** — network in; clear progress out.
4. **Overlay** — same org chart with 1st / 2nd / none encoded; gaps and warm paths fall out of chart + overlay.
5. **Privacy** — one visibility setting, not a consent product.

Intelligence features should read the graph (and ontology), not bypass them.

---

## Non-goals (v1)

Out of scope for the first shippable loop:

- Messaging, inboxes, or “reach out” channels
- CRM pipelines, deal stages, or sales activity tracking
- Collecting or exposing email, phone, or other personal contact details
- Multi-tenant enterprise admin, SSO fleets, or billing complexity
- Collecting seed data: scrapers, research desks, editorial pipelines, or crawlers (that is the seeding project)
- Boiling-the-ocean news agents or full industry crawl on day one
- Perfect global person deduplication or exhaustive worldwide coverage
- A consent/contract ceremony product (one visibility control is enough)

If a request expands past ingest → public org structure → network overlay → gap/warm path, it waits.

---

## Design principles

1. **No PII by default** — growth and trust depend on it; resist feature pressure that reintroduces it.
2. **Team-side depth before overlay magic** — the map must look comprehensive on teams at launch; uploads cannot compensate for an empty skeleton. Collection of that depth lives in the seeding project; this product consumes it as CSVs.
3. **Ingest, don’t collect** — specified batch CSVs; validate, normalize, resolve. Same path for first load and later corrections.
4. **Personal payoff before altruism** — sharing must reward the sharer immediately.
5. **Public facts vs private edges** — professional facts build the shared map; social topology is consent-scoped context.
6. **Ontology-backed structure** — seniority and function are inferred from a durable model, not from title strings.
7. **Org chart is a product** — unique, durable, and reused; not a disposable visualization.
8. **Graph-native** — entities, edges, time, and provenance first; LLMs consume structure, they do not replace it.
9. **Position / role-first** — navigate work structure, not résumé pages.
10. **Explainable and temporal** — claims with provenance; “as of when” matters; inferences are labeled as such.
11. **Privacy stays out of the way** — one visibility control in the core UX.

---

## Success for an MVP

Seed CSVs for a beachhead can be imported through the specified batch path and survive validation, normalization, and conflict resolution.

A new user can then open a real team (and a vendor), see a credible org chart built from those public facts — structure and seniority that hold up without demo caveats.

If they upload a network, they additionally see who they know, a concrete coverage gap, and a warm path — on that same chart.

Strategic success is whether that feels like the start of industry infrastructure: a living map nobody else can produce.

---

## Naming

**CrowdBiz Graph.** Domain: crowd business in professional sports.
