# 0017 — Published migration names are immutable, even when the naming guard objects

- Status: accepted
- Date: 2026-09-15
- Owner decision: Elton Carvalho, 2026-09-15

## Context

`supabase/migrations/20260913214357_initial-finance.sql` was published on the repository's base branch with a hyphen in its description. Two Harness rules collide on it:

- `database-guard.mjs`, run over the whole repository (`npm run harness -- verify`), requires every migration file to match `YYYYMMDDHHMMSS_descricao.sql` with an underscored description, and warns that Supabase would otherwise ignore the migration silently.
- The same guard, run in CI against the base branch (`--base origin/<base>`), blocks any rename or edit of a migration that is already published.

Both an in-place edit (commit `6a149f3`) and a rename to `20260913214357_initial_finance.sql` (commit `e2b0b9c`) were attempted and correctly blocked by the Database gate on pull request #1.

The guard's warning does not hold for this file. The name does carry the `<timestamp>_<description>` shape; only the description contains a hyphen. `pnpm db:reset` followed by `pnpm db:test` applies the migration and passes 131 assertions, which proves Supabase does not ignore it.

## Decision

The published file keeps its name and its byte-for-byte content. The immutability rule wins over the naming rule, because renaming a published migration desynchronises every environment that has already recorded the old name in `supabase_migrations.schema_migrations`, while a hyphen in the description costs nothing.

Defects found in published SQL are fixed by a new migration. The first instance is `20260915230832_lint_clean_installment_purchase.sql`, which recreates `public.create_installment_purchase` with a clean plpgsql body.

## Consequences

- CI stays green: the base-aware guard only inspects migrations the pull request changes, and this file is no longer changed.
- `npm run harness -- verify` reports one `db:guard` naming finding on this file, permanently. It is expected and is not a reason to edit the file or to weaken the guard.
- New migrations are created with `supabase migration new <descricao>` so the naming rule holds for everything written from here on.
- Revisiting this means changing a guardrail (`.harness/scripts/database-guard.mjs`) to skip published migrations in the naming check, which needs the owner's explicit approval and is out of scope for this decision.
