# CrowdBiz ontology and data contract (MVP)

**Status:** locked

**MVP goal:** Import seed claim batches, interpret titles with authored
vocabularies, and display accurate org charts that are intuitive to explore.

**Out of MVP:** `knows`, warm paths, coverage overlays, probabilistic identity,
`REPORTS_TO`, and organization-to-organization commercial edges.

Function and seniority vocabularies are versioned, authored YAML under
`ontology/`. They are not inferred from scrape data, are not graph nodes, and
never appear on claims. Matching by rules, models, or review is not part of the
ontology.

Vocabularies (both accepted):

- [`functions.v2.yaml`](functions.v2.yaml) — `version: 2`
- [`seniority.v1.yaml`](seniority.v1.yaml) — `version: 1`

## 1. Object model

The MVP has three objects:

| Object | Graph representation |
| --- | --- |
| Organization | Node |
| Person | Node |
| Affiliation | Attributed `AFFILIATED_WITH` edge from Person to Organization |

Function and seniority are vocabulary slugs stored on an interpreted
affiliation. They are not objects.

Role, job, seat, department, and manager are not objects. A chart department is
a projection that groups affiliations by function. A chart level is a
projection based on seniority.

If `REPORTS_TO` is introduced after the MVP, it will connect affiliation to
affiliation, not person to person.

## 2. Objects

### Organization

An organization is a club, vendor, agency, operator, or similar entity. For the
MVP, its stable `org_id` is the claim's `org_ref`.

| Field | Required | Meaning |
| --- | --- | --- |
| `org_id` | yes | Stable identifier, for example `nfl-green-bay-packers` |
| `name` | yes | Display name |
| `org_type` | yes | `team`, `vendor`, `agency`, `operator`, or `other` |
| `website` | no | Public website |

Producer-only fields, such as a LinkedIn company URL and scrape settings,
remain collection state and are not graph truth.

### Person

A person participates in one or more organizations. For the MVP, `person_id`
is the seed claim's `person_ref`. There is no identity clustering.

| Field | Required | Meaning |
| --- | --- | --- |
| `person_id` | yes | Stable identifier equal to claim `person_ref` |
| `full_name` | yes | Display name |
| `public_profile_url` | no | Checkable public professional profile |

Email addresses, phone numbers, messaging handles, and other contact channels
are not collected or stored.

### Affiliation

An affiliation records how a person participates in one organization as of a
date. It is the fact from which the chart is built.

| Field | Required | Source |
| --- | --- | --- |
| `affiliation_id` | yes | Affiliation claim's `claim_id` |
| `person_id` | yes | Claim |
| `org_id` | yes | Claim |
| `affiliation_type` | yes | Claim |
| `raw_title` | yes | Claim; source string preserved unchanged |
| `start_date` | no | Claim; `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` |
| `end_date` | no | Claim; omitted for current seed roles |
| `as_of` | yes | Claim observation date |
| `function` | after interpretation | Derived vocabulary slug or `unknown` |
| `seniority` | after interpretation | Derived vocabulary slug or `unknown` |
| `in_chart` | after interpretation | Derived chart visibility |

The closed affiliation type set is:

`employed | contracted | advising | board | ownership | other`

`function` and `seniority` are applied after import from `raw_title` and the
accepted vocabularies. They never appear on the source claim. An uncertain
interpretation uses `unknown` rather than a guess.

Competitive-sport work and in-game / TV / radio production crews are dropped
at collection (`on_field` and `broadcast` in curation) and are not imported
into the graph. Crowd-business titles that mention the sport (for example
football communications or community outreach) and owned social / editorial
work are kept. Function slugs remain in the vocabulary for anything that
still reaches interpretation.

`in_chart` requires both of the following:

- the assigned function has `scope: in`, or the function is `unknown`, so that
  unresolved affiliations remain visible rather than disappearing; and
- `affiliation_type` is `employed`, so that board seats, ownership stakes, and
  advisory relationships are stored and navigable without being drawn as
  positions on an org chart. Titles such as Owner and Board Member interpret
  to function `ownership` (`scope: out`) for the same reason.

A person may have multiple affiliations. MVP charts show current affiliations
for the opened organization.

## 3. Graph

```text
(Person) --AFFILIATED_WITH--> (Organization)
```

The `AFFILIATED_WITH` edge carries all affiliation fields described above.

The MVP graph does not contain:

- `KNOWS`
- `REPORTS_TO`
- organization-to-organization commercial edges
- department, seat, role, job, or manager nodes

## 4. Org-chart projection

For one organization:

1. Select its current `AFFILIATED_WITH` edges where `in_chart` is true, which
   restricts the chart to employed affiliations in an in-scope function.
2. Group affiliations by `function`.
3. Stack each group by seniority rank, with lower ranks displayed as more
   senior.
4. Display the person's name and `raw_title`, with function and seniority
   clearly presented as derived values.

Affiliations with `function: unknown` remain visible in an Unknown group.
Affiliations with `seniority: unknown` remain visible in an unranked band.

MVP exploration follows organization → function group → person. It does not
present a reporting tree or personal network.

## 5. Vocabularies

Code reads vocabulary files as data. A slug is a stable identifier: labels may
change, but a slug must never be reused for a different meaning. A slug already
referenced by interpreted data must be deprecated rather than deleted.

### Function

[`functions.v2.yaml`](functions.v2.yaml) is accepted and supersedes
[`functions.v1.yaml`](functions.v1.yaml). Version 1 must not be used for
interpretation.

Each function defines:

| Field | Meaning |
| --- | --- |
| `slug` | Stable identifier stored on the affiliation |
| `label` | Display name |
| `scope` | `in` or `out` |
| `definition` | What belongs to the function |
| `boundary` | What does not belong to the function |

`unknown` is always present and is used when confidence is insufficient. It is
not a category to eliminate by guessing.

### Seniority

[`seniority.v1.yaml`](seniority.v1.yaml) is accepted. The rank-2 slug is
`vice_president` (not `executive`) so it does not collide with the function
slug `executive`.

Each band defines:

| Field | Meaning |
| --- | --- |
| `slug` | Stable identifier stored on the affiliation |
| `rank` | Sort key only; lower means more senior |
| `label` | Display name |
| `typical` | Authored typical title patterns |

Rank is never an identifier. The `unknown` band has `rank: null`. Modifiers are
authored interpretation guidance; they do not create graph objects or
functions. Seniority must not be inferred from function.

## 6. Claim contract

A claim batch is the unit of import. Accepted batches are the source from which
the graph can be rebuilt. Producer tables are collection state and are not
graph inputs.

A batch contains:

- `organizations.csv`
- `persons.csv`
- `affiliations.csv`
- `manifest.json`

A batch that fails validation is not imported. Function, seniority, and contact
channel columns are forbidden in every claim CSV.

### Universal claim fields

Every CSV row contains:

| Field | Rule |
| --- | --- |
| `claim_id` | Required and unique within the batch |
| `source_url` | Required and checkable; never synthesized |
| `source_type` | Required and from the closed set below |
| `observed_at` | Required ISO-8601 timestamp |

If a public profile URL did not resolve, `source_url` is the company listing
where the fact was observed.

Allowed source types are:

`staff_directory | press_release | org_website | filing | manual_research |
profile_self_report | user_correction | self_assertion | identity_assertion |
other`

### `organizations.csv`

Required fields are the universal fields plus `org_ref`, `name`, and
`org_type`. `website` is optional. Claim `org_ref` becomes graph `org_id`.

### `persons.csv`

Required fields are the universal fields plus `person_ref` and `full_name`.
`public_profile_url` and `public_profile_id` are optional. Claim `person_ref`
becomes graph `person_id`.

### `affiliations.csv`

Required fields are the universal fields plus `person_ref`, `org_ref`,
`raw_title`, `affiliation_type`, and `as_of`. `start_date` is optional.
`end_date` is omitted for current seed roles.

Every `person_ref` and `org_ref` must refer to a row in the same batch's person
and organization files.

### `manifest.json`

At minimum, the manifest contains:

- `producer`
- `batch_id`
- `generated_at`
- `org_scope`
- collection method and run identifier
- `collected`, `emitted`, and `curated_out` counts

The operational validator in
`crowdbiz_seeding/src/emit/validate.ts` enforces the current claim shape.

## 7. MVP pipeline

```text
validate batch
  → upsert Organization, Person, and Affiliation from claims
  → interpret raw_title into function, seniority, and in_chart
  → draw the org chart
```

Interpretation is replayable. A vocabulary or matching change re-runs
interpretation and rebuilds derived fields without rewriting claims.

How matching is allowed to change is [LEARNING.md](LEARNING.md): seed with the
current rules, human-validate unknowns as overrides, and promote only repeated
held-out patterns into rules. Human decisions survive reinterpretation.
`unknown` remains a valid outcome.

## 8. Locked and deferred

### Locked

- Organization, Person, and Affiliation are the only MVP objects.
- Affiliation is an attributed `AFFILIATED_WITH` edge.
- Function and seniority are authored, versioned YAML vocabularies.
- Function and seniority are derived and never appear on claims.
- Contact channels never appear on claims.
- Identity is the seed `person_ref`.
- The chart groups visible affiliations by function and stacks by seniority.
- Unknown function and seniority remain visible.

### Deferred

- identity clustering and identifier survival through re-clustering
- `REPORTS_TO`
- personal-network and coverage overlays
- organization-to-organization commercial edges
- title-matching implementation
