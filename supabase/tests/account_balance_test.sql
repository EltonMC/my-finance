begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

select has_function(
  'public',
  'get_checking_account_balances',
  array[]::text[],
  'account balances are aggregated by a database function without the API row limit'
);

select ok(
  not has_function_privilege('anon', 'public.get_checking_account_balances()', 'EXECUTE'),
  'anonymous callers cannot read account balances'
);

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000000098', 'balance-owner@example.test'),
  ('00000000-0000-4000-8000-000000000097', 'other-balance-owner@example.test');

insert into public.checking_accounts (id, user_id, name, opening_balance_cents) values
  ('10000000-0000-4000-8000-000000000098', '00000000-0000-4000-8000-000000000098', 'Balance account', 1000),
  ('10000000-0000-4000-8000-000000000097', '00000000-0000-4000-8000-000000000097', 'Other account', 999999);

insert into public.account_transactions (user_id, checking_account_id, account_category_id, transaction_type, description, amount_cents, occurred_on)
select
  '00000000-0000-4000-8000-000000000098',
  '10000000-0000-4000-8000-000000000098',
  category.id,
  'income',
  'Income ' || series.value,
  100,
  '2026-01-01'
from generate_series(1, 1001) as series(value)
cross join public.account_categories as category
where category.user_id = '00000000-0000-4000-8000-000000000098' and category.name = 'Receitas';

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000098';

select results_eq(
  $$ select name, balance_cents from public.get_checking_account_balances() $$,
  $$ values ('Balance account'::text, 101100::bigint) $$,
  'the database aggregates more than one thousand owner rows without leaking another account'
);

select * from finish();
rollback;
