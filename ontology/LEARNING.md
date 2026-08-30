# How CrowdBiz learns function and seniority

**Status:** agreed process. Follow this unless we explicitly replace it.

Seeding uses the current deterministic matcher. Humans then validate
residuals. Validated results improve individual records immediately. They
inform rule changes only when a reusable pattern is proven. They do not
rewrite source claims, and they do not invent vocabulary slugs by default.

`unknown` is a valid outcome. Do not optimize it away by guessing.

## Loop

```text
seed with current rules
  → queue function (and later seniority) unknowns for human review
  → apply the decision as an override on the derived affiliation
  → periodically mine repeated decisions for candidate rules
  → test a candidate against validated examples, known boundaries, and a held-out set
  → change matching only if it still holds
  → reinterpret the graph; human overrides survive
```

## What humans may decide

For each queued affiliation the reviewer chooses one of:

| Decision | Meaning |
| --- | --- |
| Classify as an existing function slug | The title belongs to a vocabulary function we already have |
| Ignore / drop | The row should not have been a crowd-business affiliation (same family as curation drops) |
| Remain unknown | Honest residual; title is real but evidence is insufficient |

Optional rationale and a timestamp belong with the decision. Reviewer identity
is required.

Do not add a new function or seniority slug from a single review, or from this
seed scrape alone. A new slug is a vocabulary change and needs a separate,
authored decision.

## Two layers, different jobs

**Overrides** fix this affiliation now. They are stored apart from claims.
Interpretation may re-run; an override still wins for that affiliation until
it is withdrawn.

**Rules** are reusable matching. A rule change is allowed only when several
independent validations show the same pattern, the pattern does not smash a
known boundary (for example Product Owner is not `ownership`), and a held-out
set that was not used to design the rule still agrees.

A validated title must not become a global rule by itself. That overfits the
seed set.

## What this must not do

- Put function or seniority onto source claims.
- Treat the current 18-team scrape as a freeze of the vocabulary.
- Collapse `unknown` because a reviewer could have guessed.
- Change YAML slugs because matching was inconvenient.
- Let reinterpretation wipe human decisions.

## Implementation notes (when we build it)

- Queue from derived `function: unknown` (later: seniority unknown too).
- Store decisions as review records, not as edits to `affiliations.csv`.
- Rebuild: claims → matcher → apply overrides → chart.
- Rule proposals come from clustered decisions, not from one-off titles.
