# 2026-09-14-rls-operation-tests: Prove financial ownership boundaries

## Outcome

The local database test suite proves that an authenticated owner can perform each currently supported direct operation while another user and an anonymous request cannot access the owner's financial rows or privileged commands.

## Gate

- Size: session — source: `.harness/upstream/approved/myfinance-mvp-foundation.md`, FR-002 and NFR-003.
- Intent gaps: none; this slice verifies the current access model and does not broaden it.
- Irreversible actions: none; local test data is reset by migrations.
- Footprint: pgTAP database tests and evidence only, with policy fixes only if a failing test demonstrates a defect.
- Readiness: PASS.

## Acceptance criteria

- [x] Anonymous access to every public finance table is denied.
- [x] An authenticated owner can select their own rows and cannot select another user's rows.
- [x] Direct owner CRUD is allowed only for the resources and lifecycle operations listed in the access matrix.
- [x] Every exposed command rejects anonymous callers and cross-user identifiers.
- [x] Duplicate recurring-bill and statement-payment commands fail safely.

## Scope

- In scope: operation-specific allow/deny pgTAP coverage for the current migration.
- Explicit non-goals: new product behavior, remote database changes, service-role client usage, or broadening table grants.

## Data and authorization

- Tables, RLS, Storage, Auth, RPC, Edge Functions: all current public finance tables and eight finance-command RPCs; tests first, policy changes only if proven necessary.
- Access matrix and DBA review: `.harness/context/access-matrix.md`; existing proposal `.harness/database/changes/2026-09-13-myfinance-mvp-foundation.md`; existing review `.harness/database/reviews/2026-09-13-myfinance-mvp-foundation.md`.
- Allow/deny tests: new operation-specific pgTAP file beside `000_rls_enabled.test.sql`.

## Evidence

- Files changed: `supabase/tests/finance_access_test.sql`, `supabase/migrations/20260914162848_revoke_anonymous_finance_access.sql`, this work item, and the existing database proposal/review evidence.
- Red: the first operation-specific pgTAP run exposed Supabase default grants: `anon` could access all ten finance tables and eight command functions; `authenticated` could delete configuration rows and directly mutate immutable financial events. The expanded privilege matrix reproduced those defects before the migration was tightened.
- Green: after the least-privilege migration and a clean local reset, `pnpm db:test` passed 98 tests across two files, including owner allow, second-user deny, anonymous denial for every table operation, manual-only account transaction creation, archived-row immutability, relationship isolation, duplicate-command safety, and all eight command RPCs.
- Verify: `pnpm db:reset` applied both migrations; `pnpm db:lint` reported no schema errors; `supabase db advisors --local` reported no issues; `npm run harness -- verify` passed lint, typecheck, tests, build, bundle-secret scan, database lint, and database tests.
- Review: fresh-context review found six gaps; all were patched. It added manual transaction creation constrained to `income`/`expense`, immutable archived configurations, per-identifier RPC isolation, full anonymous operation checks, recurring-bill relationship checks, and an unambiguous final database verdict.
- Course correction: not needed unless tests expose a contract conflict.
- Remaining risks: none within this slice; the tests use Supabase's local authenticated-role/JWT-claim pattern and run against a cleanly rebuilt schema.
- Memory consulted / captured: access matrix and current database artifacts only; no new durable memory.
