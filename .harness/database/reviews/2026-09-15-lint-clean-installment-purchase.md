# DBA Review: lint-clean-installment-purchase

## Verdict

`APPROVE`

## Plain-language summary

A função que lança compras parceladas é regravada com o mesmo comportamento, só sem duas imperfeições de escrita. Nenhum dado é apagado ou alterado, e as permissões continuam iguais.

## Findings

| Severity | Area | Evidence | Required action |
| --- | --- | --- | --- |
| P2 recommendation | migration hygiene | The published `20260913214357_initial-finance.sql` had been edited in place (commit `6a149f3`) and renamed (commit `e2b0b9c`) to silence these same warnings; the Database gate blocked both. | The published file is restored byte-for-byte and the fix moves to this new migration. Future lint findings in published SQL follow the same route. |
| P3 note | privileges | `create or replace function` preserves grants and comments; no `grant`, `revoke`, or `comment` statement is reissued. | Verified after reset: the function stays `security definer`, `search_path = ''`, executable by `authenticated` only, and keeps its `harness:allow-security-definer` comment (`db:guards` green). |

## DBA checklist

- [x] Every entity has a documented purpose and source of truth, and a table comment.
- [x] Semantic duplicate candidates were compared with the data dictionary, and new tables were added to it.
- [x] Primary keys, relationships, required fields, unique rules, checks, and delete behavior express the intended invariants.
- [x] Types, names, timestamps, money, and nullable fields are intentional.
- [x] Every column is classified `pii:none`, `pii:personal`, or `pii:sensitive`; personal and sensitive data have a purpose, retention, and deletion path.
- [x] Foreign keys to `auth.users` let an account be deleted.
- [x] Query, join, sort, RLS, and foreign-key index choices have evidence and no redundant index is introduced.
- [x] Public exposure, grants, RLS, views (`security_invoker`), functions (`search_path`, `security definer`), triggers, RPCs, and Storage were assessed; every guard exception is justified.
- [x] Access scenarios in the owner card map one-to-one to allow/deny tests (existing `supabase/tests/finance_access_test.sql` coverage for this function is unchanged and still passes).
- [x] Migration is compatible, has lock/backfill assessment, and has rollback or forward-fix handling; destructive or rewriting SQL has the owner's written approval (not applicable: 🟢 additive).
- [x] Reset, lint, pgTAP, Harness guards, security advisors, and relevant integration/performance tests are planned or recorded.

## Final evidence

- Proposal: .harness/database/changes/2026-09-15-lint-clean-installment-purchase.md
- Migration(s): 20260915230832_lint_clean_installment_purchase.sql
- Commands and results: red `pnpm db:reset` then `pnpm db:lint` → three warnings on `public.create_installment_purchase` (untyped `'{}'` cast to `uuid[]`, `v_index` shadows the loop variable, `v_index` unused); green `pnpm db:reset` then `pnpm db:lint` → `No schema errors found`; `pnpm db:test` → PASS, 131 tests in seven files.
- Reviewer: agent DBA review (harness-database-steward)
- Review date: 2026-09-15
