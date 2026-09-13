# 2026-09-13-myfinance-mvp-foundation: Deliver the MyFinance MVP foundation

## Outcome

Ship the first secure, mobile-first MyFinance slice with an authenticated React/Supabase application, a testable finance domain, and the schema needed for accounts, cards, recurring bills, statements, payments, installments, chargebacks, and estimated points.

## Delivery gate

- Change size: epic
- Upstream source or direct-intent rationale: approved upstream handoff at `.harness/upstream/approved/myfinance-mvp-foundation.md`
- Intent gaps: none; initial visual identity is a replaceable assumption.
- Irreversible actions: additive database schema only; no remote migrations or production data changes are authorized.
- Footprint: application scaffold, Docker, Supabase migrations/RPC/RLS/tests, React UI, user-facing Portuguese copy, harness commands, and local documentation.
- Readiness verdict: PASS
- Concerns accepted by owner or condition to clear: a Supabase URL and publishable key are required only for live browser integration after local verification.

## Acceptance criteria

- [ ] The implementation satisfies FR-001 through FR-032 and NFR-001 through NFR-005 from the approved handoff.
- [ ] Private user data is protected with RLS allow and deny tests.
- [ ] Every defined multi-record financial mutation is atomic and cannot create duplicate payment or recurring-bill records.
- [ ] The main flows work at a 320px viewport with accessible labels and keyboard behavior.

## Scope

- Affected areas: React/Vite application, Docker Compose, Supabase, database dictionary/review, access matrix, test/build command configuration.
- Explicit non-goals: external banking, production deployment, remote data migration, payments, credentials, partial payments, interest, live FX, reporting.
- Dependencies or decisions: approved upstream handoff and database proposal/review before SQL.
- Code-language convention: English for technical code and developer-facing text; Brazilian Portuguese for product copy.
- Memory consulted: `/Users/eltoncarvalho/.codex/memories/MEMORY.md` — Harness delivery/TDD and Mobills financial-flow guidance.
- Memory captured or updated: mobile-first MVP decision in `.harness/memory/decisions/mobile-first-mvp.md`.

## Data and authorization impact

- Tables, Storage, Auth, RPC, or Edge Functions affected: Supabase Auth, all listed finance tables, RLS policies, and finance-command RPCs.
- Access-matrix update: `.harness/context/access-matrix.md`
- Migration and RLS tests: `supabase/migrations/` and `supabase/tests/`

## UX contract

- User job and primary action: quickly record and understand private financial activity; primary actions are quick-add, mark bill paid, and pay an eligible statement.
- States: first use, loading, empty, validation error, saving, payment saved, duplicate payment, absent reward configuration, and disabled payment state.
- Keyboard and assistive-technology behavior: explicit names and states, linked errors, visible focus, reading-order navigation, keyboard-operable dialogs.
- Responsive or visual-regression risk: high for summary hierarchy and payment confirmation at 320px.

## Implementation evidence

- Files changed: planning and delivery artifacts initialized; implementation pending.
- TDD red evidence: `docker compose run --rm --build test` failed as expected because `createInstallmentPlan`, financial rules, and `App` did not yet exist; each failure was corrected with the minimum implementation.
- TDD green evidence: `docker compose run --rm --build test npm run test -- --reporter=verbose` passed 7 tests on 2026-09-13: installment distribution, points, billing-date fallback, statement payment eligibility, amount due, login form, and payment confirmation.
- TDD refactor evidence: domain rules remain isolated in `src/domain`; UI state remains in the feature route component; lint is configured but blocked from a fresh image build by Docker Desktop storage exhaustion.
- Checks run: `git diff --check` passed; Docker build passed after TypeScript/Vite configuration fixes. The build produced the Vite static bundle successfully.
- Review findings and disposition: database pre-review is `APPROVE WITH CONDITIONS`; independent implementation review is pending.
- Remaining risks: Supabase local-stack migration reset, lint, pgTAP, and RLS policy tests are blocked because Docker Desktop exhausted its storage while downloading the official local Supabase images. A Supabase URL and publishable key are also required for a live browser login.
- Independent-review evidence or proportional exception: required before PR.
- Course-correction record: not needed.
