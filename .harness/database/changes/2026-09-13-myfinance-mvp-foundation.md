# Database Change Proposal: myfinance-mvp-foundation

## Intent

- User or business outcome: persist each user's mobile-first finance ledger, card statements, recurring bills, invoice payments, installments, chargebacks, and point estimates without duplicate or cross-user financial effects.
- Entities created or changed: all entities defined in `DATA_DICTIONARY.md`.
- Explicit non-goals: external transactions, payment initiation, shared tenants, partial invoice payment, interest, live FX, destructive migration, and production backfill.

## Model and duplication check

- Data-dictionary entries consulted: all ten MyFinance MVP entries in `.harness/database/DATA_DICTIONARY.md`.
- Authoritative source for each fact: immutable financial event rows; balances, amount due, available limit, and points are derived from those rows and lifecycle state.
- Similar existing tables, fields, or views and why this is not duplicate: the repository has no existing product schema. `account_transaction` represents checking-account movement; `card_event` represents card-ledger movement and must remain distinct to prevent a card purchase from changing account balance before invoice payment.
- Derived or cached data and refresh/consistency rule: no materialized balance/statement cache in the first migration. Queries derive values from events; later caches must be rebuildable.

## Integrity and lifecycle

- Primary key and identity strategy: UUID primary keys; `user_id uuid not null references auth.users(id)` on every user-owned table.
- Relationships and cardinality: one account/card/category/rule belongs to one user; one statement belongs to one card; one card event belongs to one statement; one invoice payment settles at most one statement and creates one account transaction.
- Required fields, unique rules, checks, defaults, and delete behavior: required ownership, names, category links, positive centavo amounts, 1–31 days, positive points rate and BRL/USD rate, active/archived or open/closed/paid lifecycle checks, and unique statement payment plus unique recurring bill occurrence per month. No cascade delete of posted finance history.
- Timestamps, retention, deletion, or audit requirement: `created_at` and `updated_at` on configuration records; `posted_at` for events; financial events retained and corrected by a new event.

## Access and queries

- Tenant or ownership boundary: `user_id = auth.uid()`.
- Public API exposure, grants, RLS policies, Storage, RPC, view, function, or trigger impact: browser reads owner rows through RLS. Browser creates/edits configuration through RLS. Multi-record actions use explicitly granted, ownership-checking RPCs; no Storage or Edge Function.
- Expected read, write, join, filter, and sort paths: user-owned account/card/category lists; account event history by account/date; statements by card/closing date; events by statement/date; recurring occurrences by rule/month; payments by statement.
- Proposed indexes and read/write trade-off: index each `user_id`; indexes on foreign keys used by statements/events/payments/occurrences; compound `(credit_card_id, closing_date)` and `(recurring_bill_id, occurrence_month)` to support lists and unique lifecycle. These indexes add modest write cost but support RLS filtering and the listed daily reads.

## Migration and release plan

- Migration shape: additive initial schema.
- Compatibility with the prior application version: no prior application schema.
- Lock, volume, and backfill risk: no existing rows; short DDL locks only.
- Rollback or forward-fix plan: do not rollback by dropping financial tables after local data exists; correct migration defects with a forward additive migration. Before release, the schema has no production data.
- Test plan: local reset, `supabase db lint`, pgTAP integrity and RLS allow/deny tests, RPC duplicate/ownership integration tests, and query-plan review for the listed index paths.

## Owner approval

- Product or domain decision owner: Elton Carvalho.
- Approved to implement on: 2026-09-13 (scope approved; remote schema execution remains unapproved).
