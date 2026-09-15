# DBA Review: category-and-bill-integrity

## Verdict

`APPROVE`

## Plain-language summary

A mudança é segura: nenhum dado é apagado ou reescrito. As regras de nome de categoria, da categoria do sistema e das contas recorrentes passam a valer dentro do próprio banco, não só na tela.

## Findings

| Severity | Area | Evidence | Required action |
| --- | --- | --- | --- |
| P1 condition (resolved) | integrity | Fresh-context review: reactivating a legacy archived system category collided with an active category of the same name (23505); fallback branches were untested | `pay_card_statement` now uses the active system category, else promotes the active label, else reactivates the archived one, else creates it; `supabase/tests/invoice_payment_category_test.sql` covers each branch (red first on the collision). |
| P2 recommendation | migration | `20260914215729_provision_starter_categories.sql` corrected in place (starter `is_system` flag) | Allowed only because no migration exists on `main` or in production; after release, correct with a new migration. |

## DBA checklist

- [x] Every entity has a documented purpose and source of truth, and a table comment.
- [x] Semantic duplicate candidates were compared with the data dictionary, and new tables were added to it.
- [x] Primary keys, relationships, required fields, unique rules, checks, and delete behavior express the intended invariants.
- [x] Types, names, timestamps, money, and nullable fields are intentional.
- [x] Every column is classified `pii:none`, `pii:personal`, or `pii:sensitive`; personal and sensitive data have a purpose, retention, and deletion path.
- [x] Foreign keys to `auth.users` let an account be deleted.
- [x] Query, join, sort, RLS, and foreign-key index choices have evidence and no redundant index is introduced.
- [x] Public exposure, grants, RLS, views (`security_invoker`), functions (`search_path`, `security definer`), triggers, RPCs, and Storage were assessed; every guard exception is justified.
- [x] Access scenarios in the owner card map one-to-one to allow/deny tests.
- [x] Migration is compatible, has lock/backfill assessment, and has rollback or forward-fix handling; destructive or rewriting SQL has the owner's written approval.
- [x] Reset, lint, pgTAP, Harness guards, security advisors, and relevant integration/performance tests are planned or recorded.

## Final evidence

- Proposal: .harness/database/changes/2026-09-15-category-and-bill-integrity.md
- Migration(s): 20260915224143_category_and_bill_integrity.sql
- Commands and results: red `pnpm db:test` → 4 of 10 new assertions failed (all starter categories flagged system, archived names blocked, system category insertable); green `pnpm db:reset` then `pnpm db:test` → PASS, 131 tests in seven files; fresh-context review → APPROVE.
- Reviewer: agent DBA review (harness-database-steward)
- Review date: 2026-09-15
