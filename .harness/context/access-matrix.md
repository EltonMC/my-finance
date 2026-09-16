# Access Matrix

Update this before a Supabase schema or policy change that affects client access. The database guard fails when a migration creates a `public` table that is not named here.

| Resource | Actor | Read | Create | Update | Delete | Enforcement | Tests |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `checking_accounts` | authenticated owner | own rows | own rows | own active rows | archive only | authenticated grant plus RLS `user_id = auth.uid()` | owner CRUD; second user deny |
| `account_categories` | authenticated owner | own rows | own non-system rows | own active non-system rows | archive only (not the system category) | authenticated grant plus RLS `user_id = auth.uid()` | owner CRUD; second user deny |
| `account_transactions` | authenticated owner | own rows | direct manual rows only | none after posting | none after posting | select policy plus command RPC for system rows | owner select; other user deny; RPC ownership deny |
| `recurring_bills` | authenticated owner | own rows | own rows | own rows | pause/archive only | authenticated grant plus RLS `user_id = auth.uid()` | owner CRUD; second user deny |
| `recurring_bill_occurrences` | authenticated owner | own rows | command RPC only | command RPC only | none | select policy; command RPC verifies owner | owner select; duplicate/other-user command deny |
| `credit_cards` | authenticated owner | own rows | own rows | own active rows | archive only | authenticated grant plus RLS `user_id = auth.uid()` | owner CRUD; second user deny |
| `card_categories` | authenticated owner | own rows | own rows | own active rows | archive only | authenticated grant plus RLS `user_id = auth.uid()` | owner CRUD; second user deny |
| `card_statements` | authenticated owner | own rows | command RPC only | command RPC only | none | select policy; command RPC verifies owner | owner select; other user deny |
| `card_events` | authenticated owner | own rows | command RPC only | none after posting | none | select policy; command RPC verifies owner | owner select; other user deny |
| `invoice_payments` | authenticated owner | own rows | command RPC only | none | none | select policy; command RPC verifies owner | owner select; duplicate/other user deny |

## Access scenarios

Plain-language scenarios copied from the owner card of each database change proposal. Each line has one pgTAP test with the same wording.

- ✅ Quando uma pessoa apaga a conta, todas as contas, categorias, cartões, faturas, lançamentos e contas recorrentes dela deixam de existir. → `supabase/tests/account_deletion_test.sql`
- ❌ Quando uma pessoa apaga a conta, os dados de outra pessoa **não** são apagados. → `supabase/tests/account_deletion_test.sql`
- ❌ Uma pessoa sem login **não** executa nenhuma função financeira. → `supabase/tests/account_deletion_test.sql`
- ✅ Uma pessoa logada cria uma categoria com o nome de uma categoria que ela arquivou. → `supabase/tests/category_integrity_test.sql`
- ❌ Uma pessoa logada **não** cria duas categorias ativas com o mesmo nome. → `supabase/tests/category_integrity_test.sql`
- ❌ Uma pessoa logada **não** cria, renomeia, arquiva nem promove uma categoria do sistema. → `supabase/tests/category_integrity_test.sql`
- ❌ Uma conta recorrente ligada a uma conta ou categoria arquivada **não** gera cobrança nova. → `supabase/tests/category_integrity_test.sql`
- Statement payment always lands in one active system category, including legacy archived or missing states → `supabase/tests/invoice_payment_category_test.sql`
- Owner-scoped reads, writes, and cross-user denials for every finance table → `supabase/tests/finance_access_test.sql`

## Exceptions

- `harness:allow-security-definer` on `create_card_purchase`, `create_installment_purchase`, `create_chargeback`, `ensure_recurring_bill_occurrences`, `mark_recurring_bill_paid`, `skip_recurring_bill_occurrence`, `close_due_card_statements`, `pay_card_statement`: atomic multi-table commands executable only by `authenticated`; each derives the owner from `auth.uid()`, filters every referenced row by that owner, and uses an empty `search_path`.

Rules:

- Model grants and RLS policies together; a policy alone is not an access model.
- Scope ownership predicates to the actual tenant or user boundary.
- Document Edge Functions, views, Storage buckets, and RPC functions when they bypass or supplement client-table access.
- A `harness:allow-public` or `harness:allow-security-definer` exception is listed here with its reason.
