---
status: draft
updated: 2026-08-29
decided_by: [0002, 0003, 0004, 0010, 0013]
---

# Producer spec — profile scrape seed batch

How the seeding project turns one organization's public professional profiles into a batch this repository will accept.

[claim-schema.md](claim-schema.md) is the authority on format; this describes one way of satisfying it and adds nothing binding. Where the two disagree, the contract wins. Collection itself happens outside this repository ([ADR-0003](../decisions/0003-collection-outside-this-repo.md)).

---

## A run is one organization

One organization per collection run, one batch per run. A sweep across many organizations returns an association list — students, alumni, fans, unrelated employers — that no amount of curation rescues.

Expect roughly 100–200 usable rows for a major team's business side. Substantially fewer usually means the scrape was scoped too narrowly; substantially more usually means it caught people who merely mention the organization.

---

## Collect

| Field | Why it matters |
| --- | --- |
| Given name and family name | Primary identity evidence |
| Headline or position title, verbatim | Becomes `raw_title` |
| Organization name as shown | Organization evidence |
| Opaque profile identifier | The durable identity anchor across runs |
| Vanity profile URL | Human-checkable, and the `source_url` of the assertion |
| Position start date, where shown | See below |
| Position end date, where shown | Lets a departure be asserted rather than inferred |

**Collect start dates.** This is the single largest improvement available over the trial run. A profile is strong evidence of a start and weak evidence of a continuation, because people update on arrival and drift on departure — so the start date is the most reliable thing a profile has to offer, and without it every row collapses to "seen on this date." If the collector can reach position dates, configure it to.

## Never collect

Email, phone, personal address, date of birth, or any private contact channel. The batch is rejected outright rather than cleaned ([ADR-0004](../decisions/0004-no-pii.md)), so configure the collector not to request these fields at all — including where the platform offers them.

Do not go looking for on-field roles ([ADR-0013](../decisions/0013-on-field-roles-out-of-scope.md)), and never send a roster.

---

## Curate before emitting

A profile scrape returns everyone who says they are connected to the organization, which is a wider set than everyone who works there. Three passes, in order.

**Drop self-described associations that are not participation in the organization's work.** A Green Bay Packers shareholder is a fan who bought a share, not a member of the front office — the club has hundreds of thousands of them. Season-ticket holders, alumni, supporters, and honorary titles are the same shape. The title usually gives it away.

**Drop unambiguous on-field roles.** Scouts, coaches, player personnel, equipment, athletic training, team physicians, performance nutrition and psychology, and football operations. These are out of scope.

**Send the boundary cases.** Anything you would have to think about belongs here, not in the bin. Player engagement, alumni relations, community work that carries football in its name — classification happens in this repository, and a row that arrives can be reclassified later while a row that was dropped is simply gone. When in doubt, send it.

Do not curate on title quality. Typos, inconsistent casing, and clumsy phrasing are preserved verbatim as `raw_title`; normalization happens downstream and the original is never overwritten.

---

## Field mapping

Assuming a scrape row of given name, family name, title, organization, opaque identifier, and vanity URL.

### organizations.csv — one row

| Column | Value |
| --- | --- |
| `org_ref` | A stable slug you will reuse forever, for example `nfl-green-bay-packers` |
| `name` | The organization's name as shown |
| `org_type` | `team` |
| `website` | Official site, optional |

### persons.csv — one row per person

| Column | Value |
| --- | --- |
| `person_ref` | The opaque profile identifier, namespaced: `linkedin:ACwAADePDkcB…` |
| `full_name` | Given and family name joined, credentials stripped |
| `public_profile_id` | Same namespaced opaque identifier |
| `public_profile_url` | The vanity URL |

**Strip credentials from names.** `Shand, MBA` and `Pearce, CPA` must arrive as `Kristen Shand` and `Joshua Pearce`. Credentials in a name field corrupt exactly the matching that identity resolution depends on. Generational suffixes are part of the name: `Derrick Coleman Jr` stays whole.

`person_ref` is your reference, not an identity verdict. The durable person identifier is assigned here during resolve ([ADR-0010](../decisions/0010-person-identity-without-pii.md)).

### affiliations.csv — one row per person

| Column | Value |
| --- | --- |
| `person_ref` | Matches the person row |
| `org_ref` | Matches the organization row |
| `raw_title` | Title exactly as scraped, including typos and casing |
| `affiliation_type` | `employed` |
| `start_date` | Position start where shown, at the precision shown — a bare year stays a bare year |
| `as_of` | The run date |
| `claim_id` | `{producer}:{run_id}:{opaque_id}` |
| `source_url` | The person's vanity profile URL |
| `source_type` | `profile_self_report` |
| `observed_at` | The run timestamp |

`employed` is the honest default for a company-page scrape, since the population is people who list the organization as their employer. Non-employment cases were removed during curation.

Do not send `function`, `seniority`, or any normalized rank — a batch containing them fails validation ([ADR-0002](../decisions/0002-claims-before-interpretation.md)). Do not send `end_date` for a current position: absence means unknown, which is what you actually know.

---

## manifest.json

```json
{
  "producer": "crowdbiz-seed",
  "batch_id": "gb-packers-2026-08-29",
  "generated_at": "2026-08-29T11:42:00Z",
  "org_scope": "nfl-green-bay-packers",
  "collection": {
    "method": "profile_scrape",
    "collector": "apify/<actor-id>",
    "run_id": "<run-id>",
    "observed_at": "2026-08-29T11:42:00Z"
  },
  "counts": { "collected": 136, "emitted": 110, "curated_out": 26 }
}
```

`collector` and `run_id` make the batch reproducible, and `counts` makes the curation pass auditable — a batch that drops half its rows is saying something about the scrape's scope.

---

## Re-running

Re-import of the same batch must be idempotent, which the deterministic `claim_id` gives you: identical rows carry identical identifiers and land once.

A later run is not a re-import. It observes the same facts on a new date and legitimately produces new claims with a new `run_id`, and therefore new `claim_id`s. That is corroboration, and it is how recency accrues — never suppress it by reusing an old run identifier.

Keep `person_ref` and `org_ref` identical across runs. They are what link a person's rows over time, and changing them makes the same human arrive as a stranger.

---

## Before you send

- No contact channel appears in any column
- No `function`, `seniority`, or normalized rank
- Every row carries `claim_id`, `source_url`, `source_type`, `observed_at`
- Every affiliation row carries `as_of`
- `person_ref` and `org_ref` resolve within the batch
- `raw_title` is never a company name, a university, `Student`, or a hedge such as `not specified` — omit the row instead
- UTF-8, RFC 4180 quoting, so that `Shand, MBA` survives the comma

The batch is validated and accepted or rejected as a unit. A rejection report names the failing rows.
