# DBA Review: myfinance-mvp-foundation

## Verdict

`APPROVE WITH CONDITIONS`

## Plain-language summary

The proposed first schema is additive, has a clear per-user boundary, and separates account movement from card movement. It is safe to implement locally once the migration uses constraints, RLS, and transactional command functions as specified. The final review must include locally executed reset, lint, pgTAP, and RLS evidence before a pull request can be ready.

## Findings

| Severity | Area | Evidence | Required action |
| --- | --- | --- | --- |
| P1 condition | integrity | Proposal: lifecycle and event sections | Enforce unique payment, unique recurring occurrence, positive values, valid days, and required ownership in SQL rather than application code. |
| P1 condition | security | Access matrix and proposal: public API surface | Enable RLS, use least-privilege grants, and add explicit owner allow plus second-user deny tests for every exposed table and command RPC. |
| P1 condition | operations | Proposal: migration and release plan | Record results from local reset, lint, pgTAP, and focused command tests in this report and the work item before review. |
| P2 recommendation | performance | Proposal: access and queries | Validate the listed foreign-key and user indexes with local plans when realistic data exists; do not add unplanned indexes. |

## DBA checklist

- [x] Every entity has a documented purpose and source of truth.
- [x] Semantic duplicate candidates were compared with the data dictionary.
- [x] Primary keys, relationships, required fields, unique rules, checks, and delete behavior express the intended invariants.
- [x] Types, names, timestamps, money, and nullable fields are intentional.
- [x] Query, join, sort, RLS, and foreign-key index choices have evidence and no redundant index is introduced.
- [x] Public exposure, grants, RLS, views, functions, triggers, RPCs, and Storage were assessed where applicable.
- [x] Migration is compatible, has lock/backfill assessment, and has rollback or forward-fix handling.
- [ ] Reset, lint, pgTAP, and relevant integration/performance tests are blocked by local Docker storage exhaustion while the official Supabase stack images download.

## Final evidence

- Proposal: `.harness/database/changes/2026-09-13-myfinance-mvp-foundation.md`
- Migration(s): `supabase/migrations/20260913214357_initial-finance.sql`.
- Commands and results: local `supabase start` was attempted through the official CLI in a container without a remote connection; Docker Desktop reported `no space left on device` while downloading the official Supabase images. No database service started and no remote state changed.
- Reviewer: Harness Database Steward.
- Review date: 2026-09-13.
