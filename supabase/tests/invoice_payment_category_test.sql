begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

-- Three owners with one payable closed statement each; their system category starts in different legacy states.
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000000061', 'archived-system@example.test'),
  ('00000000-0000-4000-8000-000000000062', 'archived-system-name-taken@example.test'),
  ('00000000-0000-4000-8000-000000000063', 'no-system@example.test');

do $$
declare
  v_owner record;
begin
  for v_owner in select id, row_number() over (order by id) as n from auth.users where email in ('archived-system@example.test', 'archived-system-name-taken@example.test', 'no-system@example.test') loop
    insert into public.checking_accounts (id, user_id, name) values (('10000000-0000-4000-8000-00000000006' || v_owner.n)::uuid, v_owner.id, 'Account');
    insert into public.credit_cards (id, user_id, name, credit_limit_cents, closing_day, due_day, points_per_usd, brl_per_usd)
    values (('30000000-0000-4000-8000-00000000006' || v_owner.n)::uuid, v_owner.id, 'Card', 500000, 10, 17, 1.5, 5.5);
    insert into public.card_statements (id, user_id, credit_card_id, statement_month, closing_date, due_date, status)
    values (('60000000-0000-4000-8000-00000000006' || v_owner.n)::uuid, v_owner.id, ('30000000-0000-4000-8000-00000000006' || v_owner.n)::uuid, '2026-01-01', '2026-01-10', '2026-01-17', 'closed');
    insert into public.card_events (user_id, credit_card_id, card_statement_id, card_category_id, event_type, description, amount_cents, occurred_on, points_per_usd_snapshot, brl_per_usd_snapshot)
    select v_owner.id, ('30000000-0000-4000-8000-00000000006' || v_owner.n)::uuid, ('60000000-0000-4000-8000-00000000006' || v_owner.n)::uuid, id, 'purchase', 'Purchase', 5000, '2026-01-02', 1.5, 5.5
    from public.card_categories where user_id = v_owner.id and name = 'Compras';
  end loop;
end;
$$;

update public.account_categories set archived_at = now()
where is_system and user_id in ('00000000-0000-4000-8000-000000000061', '00000000-0000-4000-8000-000000000062');
insert into public.account_categories (user_id, name) values ('00000000-0000-4000-8000-000000000062', 'Pagamento de fatura');
delete from public.account_categories where user_id = '00000000-0000-4000-8000-000000000063' and is_system;

create temporary view payment_categories as
select payment.user_id, category.name, category.is_system, category.archived_at is null as active
from public.invoice_payments as payment
join public.account_transactions as transaction on transaction.id = payment.account_transaction_id
join public.account_categories as category on category.id = transaction.account_category_id;
grant select on payment_categories to authenticated;

set local role authenticated;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000061';
select lives_ok(
  $$ select public.pay_card_statement('60000000-0000-4000-8000-000000000061', '10000000-0000-4000-8000-000000000061', '2026-01-17') $$,
  'payment succeeds when the system category was archived'
);
select results_eq(
  $$ select name, is_system, active from payment_categories where user_id = '00000000-0000-4000-8000-000000000061' $$,
  $$ values ('Pagamento de fatura'::text, true, true) $$,
  'payment reactivates the archived system category'
);

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000062';
select lives_ok(
  $$ select public.pay_card_statement('60000000-0000-4000-8000-000000000062', '10000000-0000-4000-8000-000000000062', '2026-01-17') $$,
  'payment succeeds when the system category was archived and its name is used by an active category'
);
select results_eq(
  $$ select name, is_system, active from payment_categories where user_id = '00000000-0000-4000-8000-000000000062' $$,
  $$ values ('Pagamento de fatura'::text, true, true) $$,
  'payment uses one active system category without a duplicate name'
);

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000063';
select lives_ok(
  $$ select public.pay_card_statement('60000000-0000-4000-8000-000000000063', '10000000-0000-4000-8000-000000000063', '2026-01-17') $$,
  'payment succeeds when no system category exists'
);
select results_eq(
  $$ select name, is_system, active from payment_categories where user_id = '00000000-0000-4000-8000-000000000063' $$,
  $$ values ('Pagamento de fatura'::text, true, true) $$,
  'payment creates the missing system category'
);

select * from finish();
rollback;
