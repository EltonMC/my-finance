# 2026-09-15-harness-040-database-adequation: Existing finance schema meets Harness 0.4.0 database guards

## Outcome

A person can delete their account and every financial record they own is erased; every finance table and column is documented and classified for personal data, so `npm run harness -- verify` passes the database gates.

## Gate

- Size: session — source: Harness 0.4.0 CHANGELOG step 4 (owner request "atualiza agora o harness e continue o desenvolvimento").
- Intent gaps: account deletion behavior decided by the owner on 2026-09-15 (erase everything). Supabase Auth hardening (password length, e-mail confirmation, MFA) is a separate UX decision, out of scope.
- Irreversible actions: none locally; in production, account deletion becomes a full erasure. Owner approval of the proposal card is required before the migration.
- Footprint: one new migration (constraint replacement and comments), `supabase/tests/account_deletion_test.sql`, data dictionary and access matrix naming, DBA review.
- Readiness: CONCERNS (accepted condition: implementation waits for the owner's "Aprovado por" on `.harness/database/changes/2026-09-15-harness-040-database-adequation.md`).

## Acceptance criteria

- [x] Deleting a user with full financial history succeeds and leaves no owned row in the ten finance tables.
- [x] Another person's data is untouched by that deletion.
- [x] Anonymous callers cannot execute any public finance function.
- [x] Harness guards pass: table comments, column PII comments, justified security definer exceptions, auth.users foreign keys cascade.

## Scope

- In scope: guard adequation for the existing schema; owner-approved deletion rule.
- Explicit non-goals: account-deletion UI, Auth configuration hardening, new tables or policies, remote execution.

## Data and authorization

- Tables, RLS, Storage, Auth, RPC, Edge Functions: ten finance tables (foreign keys, comments); eight security definer RPC functions (exception comments only).
- Access matrix and DBA review: proposal drafted; DBA review pending owner approval.
- Allow/deny tests: `supabase/tests/account_deletion_test.sql` (three proposal scenarios plus deletion success).

## Security

- Protecting: personal financial data and the right to erasure.
- Abuse cases: a deletion cascade crossing owners; anonymous RPC execution.
- Mitigations and the test that proves each: owner-scoped composite foreign keys plus the other-person assertion; anon EXECUTE assertion.

## Evidence

- Files changed: proposal (owner approved 2026-09-15), DBA review, migration `20260915222036_harness_040_database_adequation.sql`, `supabase/tests/account_deletion_test.sql`, access matrix and data dictionary table names, the published `20260913214357_initial-finance.sql` left untouched (the guard forbids renaming or editing a published migration; its hyphenated description still applies cleanly and `db:test` proves Supabase applies it), owner approval lines on the two earlier proposals (confirmed 2026-09-15), `supabase/config.toml` Auth hardening with a sign-up password-rules hint, `public/_headers` and `src/security-headers.test.ts` from the template.
- Red: `pnpm db:test` → "a person with financial history can delete their account" died on `checking_accounts_user_id_fkey` (restrict); `pnpm test -- src/app/App.test.tsx` → password field had no accessible description.
- Green: `pnpm db:test` → PASS, 113 tests in five files (inter-table `restrict` keys did not block the cascade); `pnpm test` → 40 passed.
- Verify: `npm run harness -- verify` → Tudo verde.
- Review: fresh-context reviewer → no must-fix; security definer claims, cascade safety, and unweakened denials confirmed; deletion fixture extended with a chargeback parent and a paid occurrence and the other-person assertion now covers all ten tables; sensitive-inference note added to the DBA review.
- Course correction: not needed.
- Remaining risks: guard regex flagged `drop constraint …, add … on delete cascade` in one statement as 🔴; statements were split so the classification is accurate (🟢). Account deletion UI does not exist yet.
- Memory consulted / captured: none.
