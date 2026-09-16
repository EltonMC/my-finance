# 2026-09-15-mobills-account-card-parity-planning: define the expanded account and card product

## Outcome

The owner has an evidence-based inventory of Mobills account and credit-card capabilities and an updated, reviewable MyFinance requirement boundary before implementation is split into safe delivery stories.

## Gate

- Size: epic — source: owner request on 2026-09-15 plus `_bmad-output/planning-artifacts/research/mobills-account-card-feature-inventory-2026-09-15.md`
- Intent gaps: none for manual parity; provider selection intentionally deferred with Open Finance
- Irreversible actions: no external or financial mutation is authorized by this planning item
- Footprint: PRD, UX, architecture, schema, authorization, account and card feature modules
- Readiness: CONCERNS (accepted condition: PRD, UX, and architecture passed independent review; epics, readiness, and the approved handoff still require completion)

## Acceptance criteria

- [x] Mobills is inspected read-only in Google Chrome without changing financial data.
- [x] Account, transaction, card, purchase, and invoice capabilities are recorded without private values.
- [x] The owner confirmed linked reversal/replacement events for posted edit/delete actions.
- [x] The owner deferred Open Finance and selected manual parity.
- [x] Manual parity includes total, partial, and advance invoice payments.
- [x] PRD, UX, and architecture are refreshed and independently reviewed with no critical or high findings.
- [ ] Epics and the approved downstream handoff are refreshed.

## Scope

- In scope: manual accounts, account transactions, manual cards, purchases, invoices, and separately identified connected-account dependencies.
- Explicit non-goals: copying Mobills branding or source code; changing Mobills data; remote Supabase, Cloudflare, Open Finance, or payment-provider changes.

## Data and authorization

- Tables, RLS, Storage, Auth, RPC, Edge Functions: architecture defines owner-scoped universal events, private Storage attachments, atomic idempotent RPC commands, linked corrections, multiple invoice payments, credit carry-forward, and compatible migrations.
- Access matrix and DBA review: required before schema implementation.
- Allow/deny tests: required per table, object, and finance command.

## UX contract

- User job and primary action: manage day-to-day account and card activity with Mobills-level functional coverage in a MyFinance-native interface.
- Loading, empty, error, success, disabled states: refreshed for manual account/card flows, deterministic financial lifecycle, concurrency, dense 320px selection, export, correction, and high-impact review.
- Keyboard and screen-reader behavior: preserve the existing accessible, mobile-first contract.

## Evidence

- Files changed: feature inventory, PRD, design and experience spines, architecture spine, independent review reports, and this planning work item.
- Red: not applicable to upstream discovery.
- Green: not applicable to upstream discovery.
- Verify: `npm run harness -- verify --quick` passed typecheck and 29 application tests; architecture mechanical lint passed with zero findings; `git diff --check` passed.
- Review: PRD, UX, and architecture independent final gates passed with no critical or high findings after corrections.
- Course correction: in progress because the existing approved handoff excludes transfers, exports, partial payments, and the wider manual parity boundary; Open Finance remains deferred.
- Remaining risks: epic decomposition and approved handoff are pending; the dirty in-progress account slice still requires a clean local database reset that has not been authorized; the multi-document lockfile requires a separate Harness/toolchain repair and was not edited.
- Memory consulted / captured: prior MyFinance Harness and Chrome/Mobills workflow context consulted; no memory update requested.
