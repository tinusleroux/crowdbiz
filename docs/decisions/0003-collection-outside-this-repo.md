---
id: 0003
title: Data collection lives outside this repo; the boundary is a batch CSV claim contract
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
---

# ADR-0003 — Data collection lives outside this repo; the boundary is a batch CSV claim contract

## Status

`Accepted`

## Context

A credible team-side skeleton must exist on day one ([ADR-0005](0005-org-chart-is-the-product.md)), which makes seeding urgent. Experience from previous attempts is that mixing collection into the product is what stalls it: scraping, research, and editorial curation are open-ended, site-specific, and endlessly distracting, and they drag the product into crawler maintenance before the graph works at all.

Collection and modelling also fail differently. A scraper breaks when a page changes. The graph breaks when the model is wrong. Coupling them means every site change is a product incident.

## Decision

This repository does not collect data. No scrapers, crawlers, research pipelines, or editorial tooling.

The boundary is a **batch CSV claim contract**, specified here in [contracts/claim-schema.md](../contracts/claim-schema.md). A separate seeding project — and later any other producer, including news extraction — collects, curates, and emits files that satisfy that contract.

This repository owns the contract, the ingest pipeline, the graph, and the product.

## Clarification, 2026-08-29

This decision is about **collecting from third-party sources**. It does not prohibit the product from accepting claims that its own users submit.

An in-product affordance to correct an org chart, or to claim yourself and supply your own history, is a product surface whose output happens to be a claim ([ADR-0010](0010-person-identity-without-pii.md)). Such claims enter through the same pipeline with their own source types. What stays out of this repository is machinery that goes and gets data: scrapers, crawlers, research desks, and editorial pipelines.

Scope clarification only. The decision is unchanged.

## Consequences

- Producers ship independently. A new source is a new file, not a new subsystem here.
- One path for first load, corrections, and future news claims, which keeps conflict resolution honest ([ADR-0002](0002-claims-before-interpretation.md)).
- The contract must be specified well enough to be implemented by someone who cannot read our code, including provenance columns and a no-PII constraint ([ADR-0004](0004-no-pii.md)).
- Beachhead **coverage** remains a joint launch constraint. Beachhead **collection** is not this repo's work.
- Cost: we cannot fix data quality by patching a scraper. Bad input is fixed at the producer or through a corrections batch.

## Affects

- [contracts/claim-schema.md](../contracts/claim-schema.md)
- [architecture/ingest.md](../architecture/ingest.md)
- [product/vision.md](../product/vision.md)

## Source

[brainstorm/2026-08-29-vision.md](../brainstorm/2026-08-29-vision.md); lesson carried from a previous build attempt
