# Database Change Proposal: account-overview-data

## Intent

- User outcome: every new authenticated user starts with useful account and card categories, and invoice payments always retain an active applicable account category.
- Entities changed: `auth.users` trigger behavior, `account_categories`, `card_categories`, account-link validation triggers, the `get_checking_account_balances` read function, and the existing `pay_card_statement` command.
- Non-goals: remote execution, profile data, shared tenants, balance caches, category deletion, or changes to posted financial events.

## Model and integrity

- Starter categories remain ordinary user-owned rows, so the existing unique `(user_id, name)` constraints, archival lifecycle, and foreign-key history preservation apply.
- The trigger is `security definer`, has an empty search path, writes only rows owned by `new.id`, is not executable by `public`, and uses conflict-safe inserts.
- Existing users are backfilled through the same idempotent private helper during migration.
- Account transactions and recurring bills reject archived or cross-owner accounts/categories at the database boundary.
- `Pagamento de fatura` remains a system account category. If a user archived it, the transactional payment command reactivates it before recording the required categorized expense.

## Access and performance

- No table grant is broadened. Existing RLS continues to restrict all category reads and mutations to `auth.uid()`. The new balance function is `security invoker`, filters by `auth.uid()`, is executable only by `authenticated`, and aggregates in PostgreSQL so PostgREST's row limit cannot truncate balances.
- Provisioning runs once after an `auth.users` insert and creates fifteen small rows; no additional index is needed because existing unique indexes support conflict detection.

## Migration and verification

- Migration: additive trigger/function plus a compatible replacement of one existing command function.
- Rollback/forward fix: drop the trigger and function only before release; after user data exists, use a forward migration so user-owned categories are preserved.
- Tests: clean local reset, exact starter labels/counts, active-state assertions, existing operation-specific ownership suite, lint, local advisors, and full Harness verification.

## Owner approval

- Product decision owner: Elton Carvalho.
- Approved scope: 2026-09-14 through the request to continue the remaining MVP functionality; remote migration remains unapproved.

### Aprovação

- Aprovado por (nome e data): Elton Carvalho, 2026-09-15 (confirmação na conversa com o agente do escopo aprovado em 2026-09-14)
