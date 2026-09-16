# DBA Review: account-overview-data

## Verdict

`APPROVE WITH CONDITIONS`

## Findings and conditions

- The Auth trigger must use a fixed search path, least privilege, deterministic owner assignment, and conflict-safe insertion.
- Starter rows must retain existing unique constraints, RLS ownership, archival lifecycle, and historical foreign-key references.
- Replacing `pay_card_statement` must not broaden execution grants or weaken its transactional ownership checks.
- A clean reset, database lint, local advisors, starter-category pgTAP tests, the complete authorization suite, and fresh-context review must pass before final approval.

## Evidence

- Proposal: `.harness/database/changes/2026-09-14-account-overview-data.md`.
- Migration: `supabase/migrations/20260914215729_provision_starter_categories.sql`.
- Current test state: the pre-review migration passed 104 tests in three files. Review-driven aggregate, backfill, and active-link protections have tests and implementation but still require a clean local reset; the reset is intentionally paused until the owner explicitly accepts loss of disposable local database data.
- Reviewer: Harness Database Steward and Supabase security flow.
- Review date: 2026-09-14.
