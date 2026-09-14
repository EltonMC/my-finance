# Project Context

Product-owned: Harness updates never overwrite this file. Harness-wide technology and invariants live in `harness-baseline.md`.

## Product

MyFinance is a private, Brazilian-Portuguese, mobile-first personal-finance ledger. One authenticated person records checking accounts, categorized account transactions, pending monthly bills, credit-card statements, installments, chargebacks, full statement payments, and expected reward points. Bank synchronization, partial payments, interest, and live FX rates are out of scope for the first delivery.

## Project-specific rules for agents

- Financial data is private to its authenticated owner. Every client-exposed table requires explicit grants, RLS, and allow/deny coverage.
- The browser receives only the Supabase URL and publishable key; service-role credentials stay outside the client and repository.
- Product-facing copy is Brazilian Portuguese. Source code, tests, technical logs, and developer-facing artifacts are English.

## Decisions already made

1. The initial user journey is an authenticated person recording and reviewing private everyday finances on a phone.
2. The tenant boundary is one Supabase Auth user per private financial ledger.
3. Authorization is documented in `access-matrix.md`; database changes use repeatable migrations and an approved DBA review.
