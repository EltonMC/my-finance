# DBA Review: harness-040-database-adequation

## Verdict

`APPROVE WITH CONDITIONS`

## Plain-language summary

A mudança é segura. Ela não apaga nem altera nenhum dado existente: só troca a regra de exclusão da conta (agora apaga tudo junto, como você decidiu) e documenta tabelas e colunas. A condição é uma recomendação de desempenho para quando houver muitos usuários, sem impacto no MVP.

## Findings

| Severity | Area | Evidence | Required action |
| --- | --- | --- | --- |
| P2 recommendation | performance | `account_transactions`, `card_events`, `card_statements` have no `user_id`-leading index; other `user_id` indexes are partial (`archived_at is null`) | Account deletion is rare and MVP volume is small; add full `user_id` indexes if deletion or owner-wide scans show slow plans. |
| P2 recommendation | integrity | Inter-table composite foreign keys stay `on delete restrict` | The cascade test (including a chargeback parent link and a paid occurrence) proves a whole-user deletion succeeds; no change needed. |
| P2 recommendation | personal-data | Category names and descriptions are free text and may reveal health or other sensitive spending (for example "Saúde") | Kept `pii:personal`: the product never asks for sensitive data or infers from it; revisit if analytics or sharing ever read these columns. |

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

- Proposal: .harness/database/changes/2026-09-15-harness-040-database-adequation.md
- Migration(s): 20260915222036_harness_040_database_adequation.sql
- Commands and results: `pnpm db:reset` → applied; `pnpm db:test` → PASS, 113 tests in five files (account deletion red first on `checking_accounts_user_id_fkey`).
- Reviewer: agent DBA review (harness-database-steward)
- Review date: 2026-09-15
