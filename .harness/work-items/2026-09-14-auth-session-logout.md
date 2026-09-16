# 2026-09-14-auth-session-logout: End the authenticated session

## Outcome

A signed-in person can end the MyFinance session and return to the sign-in screen without changing financial data.

## Gate

- Size: session — source: `.harness/upstream/approved/myfinance-mvp-foundation.md`, FR-003.
- Intent gaps: none.
- Irreversible actions: none.
- Footprint: authenticated React shell, Supabase Auth sign-out call, accessible feedback, and tests.
- Readiness: PASS.

## Acceptance criteria

- [ ] An authenticated screen offers a clearly named sign-out action.
- [ ] Successful sign-out calls Supabase Auth and returns to sign-in.
- [ ] Sign-out is disabled while pending and a failure remains visible and retryable.

## Scope

- In scope: explicit sign-out initiated by the person.
- Explicit non-goals: global device sign-out, session-management history, automatic idle timeout, and remote Auth settings.

## Data and authorization

- Tables, RLS, Storage, Auth, RPC, Edge Functions: Supabase Auth `signOut`; no persistent-data change.
- Access matrix and DBA review: no change.
- Allow/deny tests: client behavior tests; existing RLS suite remains unchanged.

## UX contract

- User job and primary action: securely leave the private workspace.
- Loading, empty, error, success, disabled states: pending action is disabled; success returns to sign-in; error is announced and permits retry.
- Keyboard and screen-reader behavior: sign-out is a native button with visible focus and status text uses alert semantics.

## Evidence

- Files changed: `src/app/App.tsx`, `src/app/app.css`, `src/app/App.test.tsx`, and this work item.
- Red: `pnpm test -- src/app/App.test.tsx --reporter=verbose` → sign-out test failed because no `Sair` action existed.
- Green: `pnpm test -- src/app/App.test.tsx --reporter=verbose` → 20 tests passed, including pending, failure/retry, local scope, and statement-view coverage.
- Verify: `npm run harness -- verify` → lint, typecheck, 20 tests, build, bundle-secret scan, database lint, and database tests passed.
- Review: fresh-context reviewer found global-scope logout and missing statement-view access; both were fixed with local scope, shared availability, and regression tests.
- Course correction: not needed.
- Remaining risks: live hosted session behavior still requires configured public credentials.
- Memory consulted / captured: current approved handoff and work item only; no new durable memory.
