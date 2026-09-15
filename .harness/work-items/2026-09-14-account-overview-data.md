# 2026-09-14-account-overview-data: Use real accounts, categories, and balances

## Outcome

After sign-in, a person receives starter categories, can manage account and card categories, can create, rename, and archive checking accounts, and sees each active account's current balance calculated from its posted activity.

## Gate

- Size: story — source: `.harness/upstream/approved/myfinance-mvp-foundation.md`, FR-004 through FR-010.
- Intent gaps: starter labels are not prescribed; use a compact Brazilian Portuguese set that includes the system invoice-payment category.
- Irreversible actions: none; archival is reversible only through future administrative recovery, not deletion.
- Footprint: Auth trigger, category/account tables and policies, React home and settings UI, repository adapter, behavior and pgTAP tests.
- Readiness: CONCERNS (accepted condition: the final local reset awaits explicit approval because it deletes disposable local database data).

## Acceptance criteria

- [x] A newly created user receives separate active starter categories for account and card ledgers without duplicates.
- [x] The user can create, rename, and archive only their own categories.
- [x] The user can create, rename, and archive only their own checking accounts with name, optional institution, and opening balance.
- [x] The overview lists only active accounts and calculates current BRL balance from opening balance plus income minus every posted debit.
- [x] Loading, empty, success, validation, and retryable error states are accessible on mobile and keyboard.

## Scope

- In scope: FR-004 through FR-010, starter-category provisioning, account/category management, derived account balance.
- Explicit non-goals: editing or deleting posted transactions, cards, recurring bills, remote database changes, deployment.

## Data and authorization

- Tables, RLS, Storage, Auth, RPC, Edge Functions: local Auth user trigger plus existing `checking_accounts`, `account_categories`, `card_categories`, and `account_transactions` grants/RLS.
- Access matrix and DBA review: existing access matrix and foundation review; new migration remains additive and local.
- Allow/deny tests: starter provisioning, duplicate safety, owner visibility, archived-state behavior, and existing cross-user suite.

## UX contract

- User job and primary action: see real balances and add the first account without leaving the overview; manage categories from Settings.
- Loading, empty, error, success, disabled states: structural loading message, guided first-account empty state, inline errors, saved feedback, and locked pending actions.
- Keyboard and screen-reader behavior: named forms and dialogs, live status/error messages, visible focus, 44px controls, and focus returned to the relevant heading after view changes.

## Evidence

- Files changed: Auth/category migration and pgTAP tests; finance repository and calculation tests; home/settings UI, CSS, and behavior tests; database proposal/review and this work item.
- Red: `pnpm db:test` → six starter-category assertions failed with zero rows; `pnpm test -- src/app/FinanceHome.test.tsx` → repository/UI module and behavior were absent; `pnpm test -- src/data/finance-repository.test.ts` → balance calculator was absent.
- Green: before the review patches, `pnpm db:test` passed 104 tests in three files. After all nine review patches, `pnpm test` passed 29 application tests in four files; `pnpm lint` and `pnpm typecheck` passed. The expanded database suite is pending a clean reset.
- Local reset (owner approved 2026-09-15): `pnpm db:reset` then `pnpm db:test` → 5 real failures: `anon` kept EXECUTE on `get_checking_account_balances()` (Supabase default grant) and four recurring-bill cross-owner denials now raised by the active-link trigger instead of the foreign key. Fixed with `revoke execute ... from anon` and matching assertion messages (denial still required); `pnpm db:test` → PASS, 109 tests in four files.
- Verify (Harness 0.4.0, 2026-09-15): lint, typecheck, test, build, bundle-secrets, db:lint, db:test, db:advisors pass. Fail: `db:guard` (dictionary/access-matrix table names, migration name, missing owner approvals), `supabase:config` (weak Auth defaults), `db:guards` (security definer exception, table comments, PII column comments, auth.users FK on account deletion). These are 0.4.0 rules applied to the whole existing schema and need owner decisions; resolved by `2026-09-15-harness-040-database-adequation`.
- Final verify (2026-09-15): `npm run harness -- verify` → Tudo verde (lint, typecheck, 40 unit tests, build, bundle-secrets, db:guard, supabase:config, db:lint, 113 pgTAP tests, db:guards, db:advisors).
- Recheck review (`harness-code-reviewer` definition, fresh context, 2026-09-15) → APPROVE AFTER MUST-FIX with no must-fix. Should-fix patched test-first (red: 5 failing in `src/app/FinanceHome.test.tsx`): opening balance "10.50" was stored as R$ 1.050,00 (now decimal dot accepted, ambiguous separators rejected); duplicate settings alert; stale save error on reopened dialogs; Escape closed a dialog while saving; rename/archive offered on the system "Pagamento de fatura" category. The "no-session sign-up untested" finding was already covered by "returns to sign-in with a confirmation message when email confirmation is required".
- Follow-up corrections (owner request "faça as correções apontadas", 2026-09-15; proposal `2026-09-15-category-and-bill-integrity.md` approved): archived category names reusable with a specific duplicate-name message; only "Pagamento de fatura" is a system category (all starter account categories had been flagged system — corrected in the unpublished provisioning migration) and it is protected by RLS; recurring bills with an archived account or category no longer generate occurrences; `pay_card_statement` handles legacy system-category states; sign-up checks the password rule client-side. Red: `pnpm db:test` → 4 of 10 new category assertions failed, then the payment name collision died on 23505; `pnpm test` → 4 weak-password cases and duplicate-name imports failed. Green: `npm run harness -- verify` → Tudo verde (48 unit tests, 131 pgTAP tests). Review: `harness-code-reviewer` → APPROVE; should-fix payment branches fixed test-first.
- Still open (owner decision): chargeback amount/parent type and installment/occurrence horizons are unbounded; card events can land on closed or paid statements; manual transactions and recurring bills may use the system category; account deletion UI; the hosted Supabase Auth settings must mirror `supabase/config.toml`.
- Review: fresh-context review found nine issues; all were patched in code and tests: database-side balance aggregation beyond 1,000 rows, active category constraints, removal of simulated finance data, existing-user backfill, exact mutation-result checks, accessible validation, dialog/view focus, stale-load protection, and unambiguous settings error state.
- Course correction: not needed.
- Remaining risks: final database reset/test, advisors, full Harness verification, and a reviewer recheck remain required; starter labels may be refined later without changing the provisioning contract.
- Memory consulted / captured: approved handoff, PRD requirements, design surfaces, access matrix, and database artifacts only.
