begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

insert into auth.users (id, email)
values ('00000000-0000-4000-8000-000000000071', 'category-owner@example.test');

insert into public.checking_accounts (id, user_id, name) values
  ('10000000-0000-4000-8000-000000000071', '00000000-0000-4000-8000-000000000071', 'Active account'),
  ('10000000-0000-4000-8000-000000000072', '00000000-0000-4000-8000-000000000071', 'Archived account');

insert into public.recurring_bills (id, user_id, checking_account_id, account_category_id, description, amount_cents, due_day, start_date)
select '50000000-0000-4000-8000-000000000071', '00000000-0000-4000-8000-000000000071', '10000000-0000-4000-8000-000000000071', id, 'Active bill', 1000, 5, '2026-01-01'
from public.account_categories where user_id = '00000000-0000-4000-8000-000000000071' and name = 'Moradia';
insert into public.recurring_bills (id, user_id, checking_account_id, account_category_id, description, amount_cents, due_day, start_date)
select '50000000-0000-4000-8000-000000000072', '00000000-0000-4000-8000-000000000071', '10000000-0000-4000-8000-000000000072', id, 'Bill on archived account', 1000, 5, '2026-01-01'
from public.account_categories where user_id = '00000000-0000-4000-8000-000000000071' and name = 'Moradia';
insert into public.recurring_bills (id, user_id, checking_account_id, account_category_id, description, amount_cents, due_day, start_date)
select '50000000-0000-4000-8000-000000000073', '00000000-0000-4000-8000-000000000071', '10000000-0000-4000-8000-000000000071', id, 'Bill on archived category', 1000, 5, '2026-01-01'
from public.account_categories where user_id = '00000000-0000-4000-8000-000000000071' and name = 'Lazer';

update public.checking_accounts set archived_at = now() where id = '10000000-0000-4000-8000-000000000072';
update public.account_categories set archived_at = now() where user_id = '00000000-0000-4000-8000-000000000071' and name = 'Lazer';

select results_eq(
  $$ select name from public.account_categories where user_id = '00000000-0000-4000-8000-000000000071' and is_system $$,
  $$ values ('Pagamento de fatura'::text) $$,
  'only the invoice-payment starter category is a system category'
);

insert into public.credit_cards (id, user_id, name, credit_limit_cents, closing_day, due_day, points_per_usd, brl_per_usd) values
  ('30000000-0000-4000-8000-000000000071', '00000000-0000-4000-8000-000000000071', 'Card', 500000, 10, 17, 1.5, 5.5);
insert into public.card_statements (id, user_id, credit_card_id, statement_month, closing_date, due_date, status) values
  ('60000000-0000-4000-8000-000000000071', '00000000-0000-4000-8000-000000000071', '30000000-0000-4000-8000-000000000071', '2026-01-01', '2026-01-10', '2026-01-17', 'closed');
insert into public.card_events (user_id, credit_card_id, card_statement_id, card_category_id, event_type, description, amount_cents, occurred_on, points_per_usd_snapshot, brl_per_usd_snapshot)
select '00000000-0000-4000-8000-000000000071', '30000000-0000-4000-8000-000000000071', '60000000-0000-4000-8000-000000000071', id, 'purchase', 'Purchase', 5000, '2026-01-02', 1.5, 5.5
from public.card_categories where user_id = '00000000-0000-4000-8000-000000000071' and name = 'Moradia';

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000071';

select lives_ok(
  $$ insert into public.account_categories (user_id, name) values ('00000000-0000-4000-8000-000000000071', 'Lazer') $$,
  'owner reuses the name of an archived account category'
);
select throws_matching(
  $$ insert into public.account_categories (user_id, name) values ('00000000-0000-4000-8000-000000000071', 'Moradia') $$,
  'duplicate key',
  'owner cannot create two active account categories with the same name'
);
select lives_ok(
  $$
    update public.card_categories set archived_at = now() where name = 'Compras';
    insert into public.card_categories (user_id, name) values ('00000000-0000-4000-8000-000000000071', 'Compras');
  $$,
  'owner reuses the name of an archived card category'
);
select throws_matching(
  $$ insert into public.account_categories (user_id, name, is_system) values ('00000000-0000-4000-8000-000000000071', 'Fake system', true) $$,
  'row-level security',
  'owner cannot create a system account category'
);
select is_empty(
  $$ update public.account_categories set name = 'Renamed system' where is_system returning id $$,
  'owner cannot rename the system account category'
);
select is_empty(
  $$ update public.account_categories set archived_at = now() where is_system returning id $$,
  'owner cannot archive the system account category'
);
select throws_matching(
  $$ update public.account_categories set is_system = true where name = 'Moradia' $$,
  'row-level security',
  'owner cannot promote an account category to system'
);

select is(
  public.ensure_recurring_bill_occurrences('2026-01-01'),
  1,
  'occurrences are generated only for bills whose account and category are active'
);
select results_eq(
  $$ select description from public.recurring_bill_occurrences join public.recurring_bills on recurring_bills.id = recurring_bill_occurrences.recurring_bill_id order by description $$,
  $$ values ('Active bill'::text) $$,
  'bills linked to an archived account or category create no unpayable occurrence'
);

select isnt(
  public.pay_card_statement('60000000-0000-4000-8000-000000000071', '10000000-0000-4000-8000-000000000071', '2026-01-17'),
  null,
  'owner pays a closed statement'
);
select results_eq(
  $$
    select category.is_system, (select count(*) from public.account_categories where is_system)
    from public.invoice_payments as payment
    join public.account_transactions as transaction on transaction.id = payment.account_transaction_id
    join public.account_categories as category on category.id = transaction.account_category_id
    where payment.card_statement_id = '60000000-0000-4000-8000-000000000071'
  $$,
  $$ values (true, 1::bigint) $$,
  'statement payment is categorized under the single system category'
);

select * from finish();
rollback;
