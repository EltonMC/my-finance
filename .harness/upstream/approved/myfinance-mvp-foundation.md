# Upstream Handoff: myfinance-mvp-foundation

## Status

`APPROVED`

## BMad sources

- Planning path used: product brief → PRD → UX spines → architecture spine.
- Source artifacts under `_bmad-output/`:
  - `planning-artifacts/briefs/brief-myfinance-2026-09-13/brief.md`
  - `planning-artifacts/prds/prd-myfinance-2026-09-13/prd.md`
  - `planning-artifacts/ux-designs/ux-myfinance-2026-09-13/DESIGN.md`
  - `planning-artifacts/ux-designs/ux-myfinance-2026-09-13/EXPERIENCE.md`
  - `planning-artifacts/architecture/architecture-myfinance-2026-09-13/ARCHITECTURE-SPINE.md`
- Upstream owner approval and date: owner approved the expanded MVP in conversation on 2026-09-13.
- Upstream requirement amendment: owner specified on 2026-09-14 that user-account creation must ask for only name, email, and password.

## Context contract

- Default downstream context: this handoff and `.harness/work-items/2026-09-13-myfinance-mvp-foundation.md`.
- Source artifacts are not loaded by default.

| Decision or question | Source path and heading | Read only when |
| --- | --- | --- |
| User-account creation fields | `planning-artifacts/prds/prd-myfinance-2026-09-13/prd.md` — Identity and private data | Registration, authentication, or profile behavior is being implemented or changed. |
| Card settlement and points | `planning-artifacts/prds/prd-myfinance-2026-09-13/prd.md` — Invoice payment and reward-point estimates | Payment, chargeback, or point-calculation behavior is uncertain. |
| Mobile interaction states | `planning-artifacts/ux-designs/ux-myfinance-2026-09-13/EXPERIENCE.md` — State Patterns and Key Flows | A screen lacks a defined empty, error, success, or accessibility behavior. |
| Database command ownership | `planning-artifacts/architecture/architecture-myfinance-2026-09-13/ARCHITECTURE-SPINE.md` — AD-1 through AD-6 | A migration, RLS policy, or RPC decision conflicts with the contract. |

## Delivery contract

- **Outcome and user value:** a mobile-first, authenticated private finance app where a person can manage checking accounts, categorized activity, recurring bills, cards, statements, installments, chargebacks, full invoice payments, and point estimates.
- **Explicit non-goals:** bank aggregation, payment initiation, partial payment, interest, live FX, budgets, reports, export, native apps, and shared accounts.
- **Acceptance criteria:** FR-001 through FR-032 and NFR-001 through NFR-005 in the linked PRD. FR-001 requires user-account creation with only name, email, and password; login remains email and password.
- **UX:** 320px mobile operation, accessible single-column forms, explicit financial-impact confirmation, and no color-only financial state.
- **Architecture:** private RLS ownership, centavo values, immutable posted events, atomic multi-record RPC commands, derived statements, and per-event reward snapshots.
- **Data and authorization:** additive Supabase migrations, a data-dictionary entry per durable entity, least-privilege grants, RLS, and allow/deny pgTAP tests.
- **Dependencies, rollout, and risks:** scaffold React/Vite/TypeScript inside Docker Compose; provision Supabase credentials after local verification. A local browser demo may use configured public credentials only.

## Open questions

No upstream blocker. The initial ledger default visuals are deliberately replaceable because no brand identity was supplied.

## Downstream routing

- Harness work item: `.harness/work-items/2026-09-13-myfinance-mvp-foundation.md`
- Required skills: feature delivery, UX TDD, database steward, Supabase security, local Docker, and Git PR delivery.
- Evidence required before PR: TDD red/green/refactor record, containerized lint/type/test/build, local migration reset/lint/pgTAP RLS tests, independent review, and visual evidence for critical mobile flows.
