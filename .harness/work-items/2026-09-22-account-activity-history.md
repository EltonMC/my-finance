# 2026-09-22-account-activity-history: Show one account's transaction history

## Outcome

A signed-in person can open an account from the overview and read its existing transaction history, including date, description, category, direction, amount, and system origin when applicable.

## Gate

- Size: story — approved handoff `.harness/upstream/approved/myfinance-mvp-foundation.md`, FR-012.
- Intent gaps: none for read-only posted history; pending and correction flows belong to the expanded planning boundary.
- Irreversible actions: none.
- Footprint: add `src/features/activity/{api,hooks,AccountActivityPage}` for an owner-scoped Supabase read, query hook, and account activity screen; change `src/app/FinanceShell.tsx` and `src/app/routes.tsx` for navigation; add localized copy and date formatting in `src/shared/`; add route behavior tests. Reuse `getSupabaseClient`, `throwIfDatabaseError`, `useQuery`, `formatBrl`, `userErrorMessageKey`, and the existing account card.
- Readiness: PASS for FR-012 under the existing handoff; no new financial mutation or schema change.

## Acceptance criteria

- [x] An account card opens a stable, private history address.
- [x] History lists posted transactions newest first with a stable tie-breaker, date, description, archived category label, direction, signed amount, and system origin for invoice and recurring bill payments.
- [x] Loading, empty, missing-account, and recoverable error states are accessible and localized; an invalid address never queries the database.
- [x] A signed-out person cannot see the private history, and existing owner-only RLS remains the authorization boundary.

## Scope

- In scope: read-only history for one account using the current posted transaction schema.
- Explicit non-goals: create or correct transactions, pending states, filtering, exports, pagination, or schema changes; these remain in the expanded FR-033–FR-060 plan.

## Data and authorization

- Tables, RLS, Storage, Auth, RPC, Edge Functions: read `checking_accounts`, `account_transactions`, and `account_categories` through existing owner RLS; no policy, grant, or schema change.
- Access matrix and DBA review: `.harness/context/access-matrix.md` already grants owner-only reads; no database proposal because no database change.
- Allow/deny tests: existing `finance_access_test.sql` covers owner and cross-user reads; preserve full pgTAP gate.

## Security

- Protecting: private account names, descriptions, amounts, dates, and categories.
- Abuse cases: another signed-in person guesses an account ID; a signed-out visitor opens a saved history URL; an invalid ID causes an unintended query.
- Mitigations and tests: existing RLS allow/deny pgTAP tests, authenticated route test, UUID route validation test; render descriptions as text, never HTML.
- New third-party origins added to `public/_headers`: none.

## UX contract

- User job and primary action: open one account and scan its existing movements; return to the overview.
- Loading, empty, error, success, disabled states: visible loading status, clear empty state, retry on read error, rows with explicit direction and amount, no mutation controls.
- Keyboard and screen-reader behavior: account link and back control are keyboard operable; heading receives focus on navigation; rows expose semantic dates and readable labels; axe checks the screen.

## Evidence

- Files changed: `src/features/activity/` read API, query hook, screen, row, date helper, and tests; app route/account link, shared error mapping and localization, and responsive styles. No migration or grant changed.
- Red: `pnpm vitest run src/features/activity/AccountActivityPage.test.tsx` → 6 expected failures before route/link/screen; later link-role test failed before changing the navigation control.
- Green: focused activity UI/API tests → 9 passed; newest-first and ID tie-breaker are asserted at the API query boundary.
- Quality: refactor checklist done (feature-local row, no cross-feature imports, no duplicated formatting); Knip clean; coverage 86.65% lines, 85.81% branches, 85.61% functions, 85.04% statements (thresholds unchanged); activity axe unit tests and existing 320px/axe E2E smoke passed.
- Verify: `npm run harness -- verify --e2e` → all 14 gates green after review fixes; 68 application tests, 131 pgTAP tests, 2 E2E smoke tests.
- Review: fresh-context reviewer requested shared error mapping and query-order coverage (must fix), a native navigation link (should fix), and removal of an unchecked test cast; all addressed. Final verdict: APPROVE, no findings remaining.
- Course correction: not needed.
- Remaining risks: account records can grow large before FR-045 adds pagination; this first read is scoped to existing posted rows. Authenticated browser integration awaits the owner's local public Supabase configuration.
- Memory consulted / captured: existing approved handoff and current repository contract; no new memory captured.
