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
- Remaining risks: epic decomposition, readiness, and the refreshed approved handoff are pending. The account/activity baseline has since passed the full local Harness verification; the expanded event model still requires owner approval of its data proposal before any migration.
- Memory consulted / captured: prior MyFinance Harness and Chrome/Mobills workflow context consulted; no memory update requested.

## Execution update — 2026-09-22

The existing application has been moved to Harness feature boundaries in local commit `1cea31b`, and an account's posted transaction history has been added in local commit `a59458b`. Both changes passed `npm run harness -- verify --e2e`; neither changes the database. These commits are on stacked local branches and have not been pushed or merged.

The following is a proposed implementation order for the formal BMad epic/story workflow, not an approved replacement for it. Keep each user-visible slice and its necessary migration in focused reviewable changes; do not treat an architecture substrate by itself as a finished user feature.

| Order | User-visible slice and requirement map | Prerequisite and delivery gate |
| --- | --- | --- |
| 0 — complete | Sign-in, accounts, categories, current balances, and posted account history (selected FR-001–012) | Current app and RLS baseline verified; remaining criteria within those FRs need story-level audit. |
| 1 — foundation | Safe manual income/expenses with pending and posted states and audited corrections (FR-011, FR-035, FR-039, FR-060) | Formal epic/readiness/handoff; owner-approved event/command data card; additive migration, legacy parity tests, owner/denial tests, TDD, independent review. |
| 2 — accounts | Preferred/type/color/visibility, adjustments, archive/restore, transfers, projected balance (FR-033–038, FR-040) | Event commands and same-owner atomic transfer legs; date-only and centavo parity tests. |
| 3 — card setup | Card/category setup, purchases, invoice assignment, preferred/archive states (FR-017–020, FR-049–050 and initial FR-051) | Shared event identity, billing-cycle fixtures, RLS and 320px UX. FR-021/022 remain partial until points, credits and payments exist. |
| 4 — card ledger | Invoice lists, installments, chargebacks, points and purchase search (FR-021–026, FR-030–032, FR-053 and initial FR-055) | Atomic purchase/installment commands, points snapshots, category and invoice math tests. FR-021/022 still await the payment/carry rules. |
| 5 — settlement | Total, partial and advance invoice payments, credit carry-forward and payment correction (FR-027–029, FR-058–060; completes FR-021/022) | Separate brownfield multi-payment proposal and compatible migration; owner approval for any rewrite; linked account expense, concurrent overpayment denial, retry and carry-forward tests. |
| 6 — recurrence and corrections | Recurring bills, fixed account entries, recurring card purchases, contestation, anticipation and adjustments (FR-013–016, FR-044, FR-051–052, FR-054–056) | Immutable correction graph, unique occurrence generation, invoice/limit recalculation and concurrency tests. |
| 7 — productivity | Tags/notes, private receipts, ignored state, history filters/pagination, configurable views, bulk posting, charts and CSV/XLSX (FR-038, FR-041–043, FR-045–048, FR-053, FR-055, FR-057) | Private Storage approval, exact ordered export set, projection/chart reconciliation and 320px UX. |
| 8 — delivery | Full flow, privacy and production readiness | Preview/CI evidence, security/observability gates, owner-led merge/release. |

Before order 1 implementation, complete the installed BMad epic/story and readiness workflow in its required fresh chats, then refresh `.harness/upstream/approved/` with the owner-approved FR-001–060 contract. The draft data card for the first additive foundation is `.harness/database/changes/2026-09-22-finance-event-foundation-draft.md`. Its approval lines intentionally remain blank; no migration is authorized by this planning update.

Planning evidence (2026-09-22): `npm run harness -- verify` passed all 13 non-E2E gates; `git diff --check` passed. Fresh-context review of the proposed delivery order, data card, and updated project context returned APPROVE after clarifying stage boundaries, AD-4/AD-13 event contracts, and personal-data classification. No migration, schema policy, remote service, or financial record was changed. Open gates: formal BMad epics/readiness and refreshed handoff; owner approval of the data card before any migration; separate approval and backup check before any later legacy-row rewrite.
