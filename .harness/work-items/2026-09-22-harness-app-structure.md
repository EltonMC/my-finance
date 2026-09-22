# 2026-09-22-harness-app-structure: Move the existing app into Harness feature boundaries

## Outcome

The existing sign-in, registration, sign-out, account overview, account management, and category management flows continue to work through the Harness application structure and quality gates.

## Gate

- Size: session — source: owner request on 2026-09-22 to execute the agreed refactor and feature plan; existing approved handoff `.harness/upstream/approved/myfinance-mvp-foundation.md` covers the current user flows.
- Intent gaps: none for preserving the current behavior; new finance behavior belongs to later upstream stories.
- Irreversible actions: none. No remote service or database mutation is in scope.
- Footprint: `package.json`, `pnpm-lock.yaml`, root quality configuration, `src/app/` routes, providers and finance shell, `src/features/auth/`, `src/features/accounts/`, `src/features/categories/`, `src/lib/`, `src/shared/`, tests, and `e2e/`. Reuse current `src/app/App.tsx` behavior, `src/data/finance-repository.ts` operations, `src/domain/` pure rules, and the Harness application template as structural reference. Remove legacy modules only after their replacement passes tests.
- Readiness: PASS for the existing flows; database schema evolution remains a separate owner-approved work item.

## Acceptance criteria

- [x] Current authenticated and unauthenticated flows retain their observable behavior, including loading, empty, validation, error, retry, success, and disabled states.
- [x] Routes, providers, feature-local API and hooks, generated database types, form validation, error mapping, and translated product copy follow `.harness/context/code-conventions.md`.
- [x] Current finance reads and writes remain owner-scoped; no privileged browser credential or new origin is introduced.
- [x] Harness lint, typecheck, Knip, coverage, build, accessibility, browser smoke, and local database gates pass without weakening tests or thresholds.

## Scope

- In scope: structural migration of current flows and application tooling; focused signed-in smoke coverage.
- Explicit non-goals: new financial behavior, schema changes, remote deployment, and revision of product requirements.

## Data and authorization

- Tables, RLS, Storage, Auth, RPC, Edge Functions: existing Supabase Auth and finance access only; no schema or policy change.
- Access matrix and DBA review: existing `.harness/context/access-matrix.md`; no new database proposal needed for this work item.
- Allow/deny tests: preserve the existing pgTAP suite.

## Security

- Protecting: account access and private financial data.
- Abuse cases: stale browser session exposes private routes; a signed-in user attempts another user's row; a browser build includes privileged credentials.
- Mitigations and tests: authenticated route tests, expired/cross-tab session and A-to-B account-switch tests, existing RLS owner/denial pgTAP tests, and the Harness browser-bundle secret scan.
- New third-party origins added to `public/_headers`: none.

## UX contract

- User job and primary action: sign in, review balances, add an account, manage categories, and sign out.
- Loading, empty, error, success, disabled states: preserve the current visible states and retry paths; expose them through localized keys.
- Keyboard and screen-reader behavior: preserve labels, dialog focus behavior, live messages, and keyboard operation; add axe checks for new route screens.

## Evidence

- Files changed: app routes/providers/finance shell; auth, account, and category feature modules; typed Supabase client; shared localization/errors/dialog helpers; package scripts and quality configuration; unit and E2E tests. No migration or policy changed.
- Red: route address tests failed before adding `/settings`; A-to-B cache test exposed previous-user data; session expiry and cross-tab tests exposed stale private screen; pending category creation and field-description tests failed before fixes.
- Green: 59 application tests, 131 pgTAP tests, and 2 Playwright smoke tests pass after the refactor, including direct A-to-B session replacement.
- Quality: Biome, TypeScript, Knip, coverage thresholds, 320px/axe smoke, generated type drift, database guards and advisors pass.
- Verify: `npm run harness -- verify --e2e` passed all 14 gates on 2026-09-22 after the account/category split and session-identity fix. One earlier run timed out during local type generation; a standalone run matched the committed types byte-for-byte, then the complete verify passed.
- Review: first fresh-context review found cache/session isolation, feature ownership, error mapping, and accessibility gaps; all addressed. Final fresh-context verdict: APPROVE, no remaining blockers.
- Course correction: moved the combined screen to an app-level shell so account and category features have separate API, hooks, forms, and tests without cross-feature imports.
- Remaining risks: authenticated browser integration needs public local credentials configured by the owner; current branch depends on `feature/account-overview-data`; FR-033–FR-060 need a refreshed approved upstream handoff before new finance behavior.
- Memory consulted / captured: approved handoff, architecture spine AD-7, code conventions, current application and template; no new memory captured.
