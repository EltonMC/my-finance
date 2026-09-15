# DBA Review: myfinance-mvp-foundation

## Verdict

`APPROVE`

## Plain-language summary

The proposed first schema is additive, has a clear per-user boundary, and separates account movement from card movement. It is safe to implement locally once the migration uses constraints, RLS, and transactional command functions as specified. The final review must include locally executed reset, lint, pgTAP, and RLS evidence before a pull request can be ready.

## Findings

| Severity | Area | Evidence | Required action |
| --- | --- | --- | --- |
| P1 condition | integrity | Proposal: lifecycle and event sections | Enforce unique payment, unique recurring occurrence, positive values, valid days, and required ownership in SQL rather than application code. |
| P1 condition | security | Access matrix and proposal: public API surface | Enable RLS, use least-privilege grants, and add explicit owner allow plus second-user deny tests for every exposed table and command RPC. |
| P1 condition | authorization evidence | Access matrix: applicable client operations | Add owner-allow and second-user-deny pgTAP coverage for each client operation and command RPC before the product PR. |
| P2 recommendation | performance | Proposal: access and queries | Validate the listed foreign-key and user indexes with local plans when realistic data exists; do not add unplanned indexes. |

## DBA checklist

- [x] Every entity has a documented purpose and source of truth.
- [x] Semantic duplicate candidates were compared with the data dictionary.
- [x] Primary keys, relationships, required fields, unique rules, checks, and delete behavior express the intended invariants.
- [x] Types, names, timestamps, money, and nullable fields are intentional.
- [x] Query, join, sort, RLS, and foreign-key index choices have evidence and no redundant index is introduced.
- [x] Public exposure, grants, RLS, views, functions, triggers, RPCs, and Storage were assessed where applicable.
- [x] Migration is compatible, has lock/backfill assessment, and has rollback or forward-fix handling.
- [x] Local reset, database lint, and the public-schema RLS pgTAP guard passed on 2026-09-14.
- [x] Operation-specific RLS allow/deny and command-RPC tests passed locally on 2026-09-14: 98 tests cover all anonymous table operations, owner access, second-user and relationship isolation, direct manual transactions, archived-row immutability, all eight RPCs, and duplicate-command safety.

## Final evidence

- Proposal: `.harness/database/changes/2026-09-13-myfinance-mvp-foundation.md`
- Migration(s): `supabase/migrations/20260913214357_initial_finance.sql`; `supabase/migrations/20260914162848_revoke_anonymous_finance_access.sql`.
- Commands and results: local `pnpm db:reset` applied both migrations; `pnpm db:test` passed 98 tests in two files; `pnpm db:lint` reported no schema errors; `supabase db advisors --local` reported no issues. The operation-specific tests first failed against broad Supabase default grants. Fresh-context review then exposed six coverage or policy gaps, all patched and re-run successfully; the second migration now explicitly enforces the intended least-privilege access matrix.
- Reviewer: Harness Database Steward; fresh-context security verification by the Harness review flow.
- Initial review date: 2026-09-13. Final evidence review date: 2026-09-14.
