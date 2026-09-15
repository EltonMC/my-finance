# Access Matrix

Update this before a Supabase schema or policy change that affects client access. The database guard fails when a migration creates a `public` table that is not named here.

| Resource | Actor | Read | Create | Update | Delete | Enforcement | Tests |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `checking_account` | authenticated owner | own rows | own rows | own active rows | archive only | authenticated grant plus RLS `user_id = auth.uid()` | owner CRUD; second user deny |
| `account_category` | authenticated owner | own rows | own rows | own active rows | archive only | authenticated grant plus RLS `user_id = auth.uid()` | owner CRUD; second user deny |
| `account_transaction` | authenticated owner | own rows | direct manual rows only | none after posting | none after posting | select policy plus command RPC for system rows | owner select; other user deny; RPC ownership deny |
| `recurring_bill` | authenticated owner | own rows | own rows | own rows | pause/archive only | authenticated grant plus RLS `user_id = auth.uid()` | owner CRUD; second user deny |
| `recurring_bill_occurrence` | authenticated owner | own rows | command RPC only | command RPC only | none | select policy; command RPC verifies owner | owner select; duplicate/other-user command deny |
| `credit_card` | authenticated owner | own rows | own rows | own active rows | archive only | authenticated grant plus RLS `user_id = auth.uid()` | owner CRUD; second user deny |
| `card_category` | authenticated owner | own rows | own rows | own active rows | archive only | authenticated grant plus RLS `user_id = auth.uid()` | owner CRUD; second user deny |
| `card_statement` | authenticated owner | own rows | command RPC only | command RPC only | none | select policy; command RPC verifies owner | owner select; other user deny |
| `card_event` | authenticated owner | own rows | command RPC only | none after posting | none | select policy; command RPC verifies owner | owner select; other user deny |
| `invoice_payment` | authenticated owner | own rows | command RPC only | none | none | select policy; command RPC verifies owner | owner select; duplicate/other user deny |

## Access scenarios

Plain-language scenarios copied from the owner card of each database change proposal. Each line has one pgTAP test with the same wording.

- _✅ A signed-in person reads their own records. → `supabase/tests/database/<resource>_rls.test.sql`_
- _❌ A signed-in person cannot read another person's records. → `supabase/tests/database/<resource>_rls.test.sql`_

Rules:

- Model grants and RLS policies together; a policy alone is not an access model.
- Scope ownership predicates to the actual tenant or user boundary.
- Document Edge Functions, views, Storage buckets, and RPC functions when they bypass or supplement client-table access.
- A `harness:allow-public` or `harness:allow-security-definer` exception is listed here with its reason.
