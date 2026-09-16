# 2026-09-14-account-registration: Create a user account

## Outcome

A person can switch from sign-in to user-account creation and register with only name, email, and password. The submitted name is display metadata only and never participates in authorization.

## Gate

- Size: session — source: `.harness/upstream/approved/myfinance-mvp-foundation.md`, amended FR-001.
- Intent gaps: none.
- Irreversible actions: none; no remote Supabase or production change is authorized.
- Footprint: React authentication screen, Supabase Auth client call, behavior tests, and mobile form styling.
- Readiness: PASS.

## Acceptance criteria

- [ ] The sign-in screen offers a clear path to create a user account.
- [ ] User-account creation requests exactly name, email, and password.
- [ ] Submission calls Supabase Auth with email and password and stores name only as user display metadata.
- [ ] A failed registration shows an accessible error and allows another attempt.
- [ ] The user can return to sign-in without losing access to the existing login flow.

## Scope

- In scope: sign-in/registration mode switching, registration submission, pending/error/success behavior, accessible labels, and phone-width layout.
- Explicit non-goals: password confirmation, phone, username, social login, password recovery, profile editing, CAPTCHA, remote Auth configuration, and a public profile table.

## Data and authorization

- Tables, RLS, Storage, Auth, RPC, Edge Functions: Supabase Auth client sign-up only; no table, RLS, Storage, RPC, Edge Function, or migration change.
- Access matrix and DBA review: no matrix change; `user_metadata.name` is user-controlled display data and must not authorize access.
- Allow/deny tests: existing RLS suite remains authoritative; the client test verifies the Auth request boundary.

## UX contract

- User job and primary action: create a private MyFinance user account from the authentication screen.
- Loading, empty, error, success, disabled states: empty required fields use native validation; submission disables the primary button; Auth failure shows an alert and re-enables retry; an immediate session enters the app; email-confirmation mode shows a success message and returns to sign-in.
- Keyboard and screen-reader behavior: mode controls and form are keyboard operable; inputs have explicit labels and appropriate autocomplete values; feedback uses status or alert semantics.

## Evidence

- Files changed: auth requirement sources and handoff, `src/app/App.tsx`, `src/app/app.css`, `src/app/App.test.tsx`, and this work item.
- Red: `pnpm test -- src/app/App.test.tsx --reporter=verbose` → two registration tests failed because no create-account control existed.
- Green: `pnpm test -- src/app/App.test.tsx --reporter=verbose` → 16 tests passed after implementation and review fixes.
- Verify: `npm run harness -- verify` → lint, typecheck, 16 tests, build, bundle-secret scan, database lint, and database tests passed.
- Review: four independent layers found seven grouped patches; every patch was applied and verified.
- Course correction: upstream FR-001, brief, handoff, and foundation work item were updated before implementation.
- Remaining risks: hosted Supabase email-confirmation settings may differ from local configuration and require a live browser check before release.
- Memory consulted / captured: global MyFinance setup memory consulted; no new durable project memory captured.

### Review Findings

- [x] [Review][Patch] Recover from rejected Auth requests and prove retry works [`src/app/App.tsx`:62]
- [x] [Review][Patch] Prevent a stale initial session lookup from undoing successful authentication [`src/app/App.tsx`:20]
- [x] [Review][Patch] Lock mode switching during submission and verify the pending state [`src/app/App.tsx`:127]
- [x] [Review][Patch] Reject a name that becomes empty after trimming [`src/app/App.tsx`:65]
- [x] [Review][Patch] Clear the password when registration returns to sign-in [`src/app/App.tsx`:79]
- [x] [Review][Patch] Announce mode changes with focus and verify the sign-up-to-sign-in round trip [`src/app/App.tsx`:102]
- [x] [Review][Patch] Verify the registration-specific missing-Supabase error [`src/app/App.tsx`:50]

Rejected: none. Four review layers completed without failure; duplicate findings were grouped by root cause.
