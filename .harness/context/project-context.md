# Project Context

Product-owned: Harness updates never overwrite this file. Harness-wide technology and invariants live in `harness-baseline.md`.

## Product

MyFinance is a private, Brazilian-Portuguese, mobile-first personal-finance ledger. The current browser app covers authentication, account and category management, balances, and posted account history. The approved manual MVP also includes direct and pending account activity, recurring bills, credit cards and statements, installments, chargebacks, total/partial/advance invoice payments, and expected reward points. Open Finance bank synchronization, payment initiation, interest, and live FX rates are deferred. The expanded FR-033–FR-060 handoff still needs epic/story readiness before new finance behavior is implemented.

## Project-specific rules for agents

- Financial data is private to its authenticated owner. Every client-exposed table requires explicit grants, RLS, and allow/deny coverage.
- The browser receives only the Supabase URL and publishable key; service-role credentials stay outside the client and repository.
- Product-facing copy is Brazilian Portuguese. Source code, tests, technical logs, and developer-facing artifacts are English.

## Decisions already made

1. The initial user journey is an authenticated person recording and reviewing private everyday finances on a phone.
2. The tenant boundary is one Supabase Auth user per private financial ledger.
3. Authorization is documented in `access-matrix.md`; database changes use repeatable migrations and an approved DBA review.
