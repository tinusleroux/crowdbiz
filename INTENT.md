# CrowdBiz Graph

CrowdBiz Graph makes the crowd-business side of professional sports legible — who sits where, how organizations are structured, and how a personal network reaches into them.

Crowd business is the work of managing, operating, and monetizing live crowds: ticketing, stadium operations, game presentation, local sponsorships, merchandise, security, concessions. Front-office people are usually described as working in “sports.” Most of that work has little to do with coaches, players, or the on-field product.

The industry is opaque. It is hard to see who decides what, who the key people are, and whether you already have a path to them. No existing product treats that structure as infrastructure.

The ambition is to become the default operating surface for teams, vendors, sponsors, agencies, and operators — a living pulse of who holds which seats, how organizations connect, and how that picture is changing. Sharing should improve the map for everyone while remaining individually rational and low-friction to join.

## What it is

A living map: people and organizations, participation over time, department-like structure and reporting, commercial relationships, and a personal network sitting on top of that structure.

Users navigate structure. A public org chart is the base view. A personal network is an overlay on it, not a directory of profiles.

It is not a CRM, a messenger, or a contact database. It is not LinkedIn with sports filters. Producers exist to feed the map; they are not the product.

Three bets sit under that:

1. **No personal contact data.** Email, phone, and messaging handles are not collected or exposed, including for matching. Professional facts and relationship context are what travel. Contributing should feel like adding to an industry map rather than surrendering an address book.

2. **The org chart is the rare asset.** A credible chart of a team or vendor, built from public professional facts, does not exist in this industry. Overlays, coverage gaps, and warm paths are projections on that chart. Team-side depth is a launch constraint, not a backlog item. Vendors and agencies feel the access pain most sharply, which shapes the payoff we lead with, not what we seed.

3. **Structure makes the map intelligible.** People, participation, organizations, vendors, sponsors, time — stored as navigable structure so both the UI and later assistants can walk it, cite it, and summarize it. Assistants query the graph; they do not substitute for it.

From public facts alone, someone opens an organization and sees a real org chart: structure, functions, seniority. After uploading a connections export, the same chart answers where people they know sit, where coverage is thin, and what the warm paths in are.

Trust without contact data comes from provenance, recency, and corroboration — not from holding identities. Claims carry a source. Time is part of truth. Conflicts keep history rather than silently overwriting. Derived function and seniority show as inference. People control visibility of what they contributed.

## Where we are

One producer lives in `crowdbiz_seeding/`. It collects public profile data one organization at a time and emits validated claim batches. The same app can import a validated batch, interpret `raw_title` with the accepted YAML vocabularies, and draw an org chart (`/chart`). Producer tables remain collection state. The graph is rebuilt from claims. Unknowns after matching are for human validation, not for guessing slugs; see `ontology/LEARNING.md`.

The claim shape is whatever `crowdbiz_seeding/src/emit/validate.ts` accepts. A batch that fails validation is never marked emitted.

## How we currently think about it

Four kinds of thing: **person**, **organization**, **affiliation**, **relationship**. An affiliation is how someone participates in an organization (employed, board, and so on). Reporting hangs on affiliations, not on people. We have not been modeling role, job, seat, or department as entities; `function` on an affiliation is the department-like grouping, and seats or department nodes would be projections.

Producers assert sourced facts — name, title, org, dates, source. Function and seniority are derived later, after claims are resolved, from the ontology and the raw title. They are not ingested as truth.

Collection is allowed in this repo. Producer tables (raw profiles, scrape runs, and so on) are collection state. The thing that should become graph truth is a validated, fully-provenanced claim batch. Downstream structure should rebuild from claims alone.

The social overlay (who knows whom) is consent-scoped and separate. It never defines org structure.

The datastore we have in mind is Postgres in three zones: an append-only claim log, a derived graph that can be dropped and rebuilt from that log, and the overlay. The web framework is still open.

Person identity is a cluster over claims, resolved probabilistically without contact channels. Public profile URLs and affiliation history are useful evidence. Internal person UIDs should survive re-clustering (retired IDs redirect). Human identity judgments — same person, not the same person — belong in the claim stream, not as one-off merges.

On-field work (coaches, players, scouting in the football-ops sense) is out of the product surface. Those affiliations can still be claimed and classified; they are filtered when we draw the crowd-business chart, not rejected at ingest. Scope sits on the affiliation, not on the person.

One function and seniority system across teams, vendors, agencies, and operators. The vocabularies will be wrong in places; that is a data change, not a new product.

## What v1 is trying to prove

1. Import a real claim batch — validate, resolve, interpret.
2. Open a real team and a real vendor and see a credible org chart, structure and seniority included, without demo caveats.
3. Upload a network onto that same chart and leave with a coverage gap or a warm path.

Non-goals for that slice: messaging, CRM, any personal contact data, enterprise admin, open-ended research collection, perfect global identity, or a consent-ceremony product. One visibility control is enough.

If a request expands past ingest, org structure, overlay, and gap or warm path, it waits.

Success is whether it feels like the start of industry infrastructure: a living map nobody else can produce.
