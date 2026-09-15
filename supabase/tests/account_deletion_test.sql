begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000000001', 'owner1@example.test'),
  ('00000000-0000-4000-8000-000000000002', 'owner2@example.test');

insert into public.checking_accounts (id, user_id, name, opening_balance_cents) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Owner 1 account', 100000),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'Owner 2 account', 200000);

insert into public.account_categories (id, user_id, name) values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Owner 1 account category'),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'Owner 2 account category');

insert into public.credit_cards (id, user_id, name, credit_limit_cents, closing_day, due_day, points_per_usd, brl_per_usd) values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Owner 1 card', 500000, 10, 17, 1.5, 5.5),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'Owner 2 card', 600000, 11, 18, 2.0, 5.5);

insert into public.card_categories (id, user_id, name) values
  ('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Owner 1 card category'),
  ('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'Owner 2 card category');

insert into public.recurring_bills (id, user_id, checking_account_id, account_category_id, description, amount_cents, due_day, start_date) values
  ('50000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Owner 1 bill', 1000, 5, '2026-01-01'),
  ('50000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Owner 2 bill', 2000, 6, '2026-01-01');

insert into public.card_statements (id, user_id, credit_card_id, statement_month, closing_date, due_date, status, paid_at) values
  ('60000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '2025-12-01', '2025-12-10', '2025-12-17', 'paid', '2025-12-17'),
  ('60000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '2025-12-01', '2025-12-11', '2025-12-18', 'paid', '2025-12-18'),
  ('60000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '2026-01-01', '2026-01-10', '2026-01-17', 'closed', null),
  ('60000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '2026-01-01', '2026-01-11', '2026-01-18', 'closed', null),
  ('60000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '2026-03-01', '2026-03-10', '2026-03-17', 'open', null),
  ('60000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '2026-03-01', '2026-03-11', '2026-03-18', 'open', null);

insert into public.card_events (id, user_id, credit_card_id, card_statement_id, card_category_id, event_type, description, amount_cents, occurred_on, points_per_usd_snapshot, brl_per_usd_snapshot) values
  ('70000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'purchase', 'Owner 1 paid purchase', 5000, '2025-12-01', 1.5, 5.5),
  ('70000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'purchase', 'Owner 2 paid purchase', 6000, '2025-12-01', 2.0, 5.5),
  ('70000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000011', '40000000-0000-4000-8000-000000000001', 'purchase', 'Owner 1 payable purchase', 7000, '2026-01-01', 1.5, 5.5),
  ('70000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000012', '40000000-0000-4000-8000-000000000002', 'purchase', 'Owner 2 payable purchase', 8000, '2026-01-01', 2.0, 5.5);

insert into public.account_transactions (id, user_id, checking_account_id, account_category_id, transaction_type, description, amount_cents, occurred_on) values
  ('80000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'invoice_payment', 'Owner 1 historical payment', 5000, '2025-12-17'),
  ('80000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'invoice_payment', 'Owner 2 historical payment', 6000, '2025-12-18');

insert into public.recurring_bill_occurrences (id, user_id, recurring_bill_id, occurrence_month, due_date) values
  ('90000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '2026-01-01', '2026-01-05'),
  ('90000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000002', '2026-01-01', '2026-01-06'),
  ('90000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '2026-04-01', '2026-04-05');

insert into public.invoice_payments (id, user_id, card_statement_id, checking_account_id, account_transaction_id, amount_cents, paid_on) values
  ('a0000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000001', 5000, '2025-12-17'),
  ('a0000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000002', 6000, '2025-12-18');

insert into public.card_events (id, user_id, credit_card_id, card_statement_id, card_category_id, parent_card_event_id, event_type, description, amount_cents, occurred_on, points_per_usd_snapshot, brl_per_usd_snapshot) values
  ('70000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000011', '40000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000011', 'chargeback', 'Owner 1 chargeback', 1000, '2026-01-02', 1.5, 5.5);

insert into public.account_transactions (id, user_id, checking_account_id, account_category_id, transaction_type, description, amount_cents, occurred_on) values
  ('80000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'recurring_bill_payment', 'Owner 1 bill payment', 1000, '2026-01-05');

update public.recurring_bill_occurrences set status = 'paid', account_transaction_id = '80000000-0000-4000-8000-000000000011'
where id = '90000000-0000-4000-8000-000000000001';

create temporary table other_person_rows as
select 'checking_accounts' as resource, count(*) as total from public.checking_accounts where user_id = '00000000-0000-4000-8000-000000000002'
union all select 'account_categories' as resource, count(*) as total from public.account_categories where user_id = '00000000-0000-4000-8000-000000000002'
union all select 'credit_cards' as resource, count(*) as total from public.credit_cards where user_id = '00000000-0000-4000-8000-000000000002'
union all select 'card_categories' as resource, count(*) as total from public.card_categories where user_id = '00000000-0000-4000-8000-000000000002'
union all select 'recurring_bills' as resource, count(*) as total from public.recurring_bills where user_id = '00000000-0000-4000-8000-000000000002'
union all select 'card_statements' as resource, count(*) as total from public.card_statements where user_id = '00000000-0000-4000-8000-000000000002'
union all select 'card_events' as resource, count(*) as total from public.card_events where user_id = '00000000-0000-4000-8000-000000000002'
union all select 'account_transactions' as resource, count(*) as total from public.account_transactions where user_id = '00000000-0000-4000-8000-000000000002'
union all select 'recurring_bill_occurrences' as resource, count(*) as total from public.recurring_bill_occurrences where user_id = '00000000-0000-4000-8000-000000000002'
union all select 'invoice_payments' as resource, count(*) as total from public.invoice_payments where user_id = '00000000-0000-4000-8000-000000000002';

select lives_ok(
  $$ delete from auth.users where id = '00000000-0000-4000-8000-000000000001' $$,
  'a person with financial history can delete their account'
);

select is_empty(
  $$
    select 'checking_accounts' from public.checking_accounts where user_id = '00000000-0000-4000-8000-000000000001'
    union all select 'account_categories' from public.account_categories where user_id = '00000000-0000-4000-8000-000000000001'
    union all select 'credit_cards' from public.credit_cards where user_id = '00000000-0000-4000-8000-000000000001'
    union all select 'card_categories' from public.card_categories where user_id = '00000000-0000-4000-8000-000000000001'
    union all select 'recurring_bills' from public.recurring_bills where user_id = '00000000-0000-4000-8000-000000000001'
    union all select 'card_statements' from public.card_statements where user_id = '00000000-0000-4000-8000-000000000001'
    union all select 'card_events' from public.card_events where user_id = '00000000-0000-4000-8000-000000000001'
    union all select 'account_transactions' from public.account_transactions where user_id = '00000000-0000-4000-8000-000000000001'
    union all select 'recurring_bill_occurrences' from public.recurring_bill_occurrences where user_id = '00000000-0000-4000-8000-000000000001'
    union all select 'invoice_payments' from public.invoice_payments where user_id = '00000000-0000-4000-8000-000000000001'
  $$,
  'deleting a person account erases all of their accounts, categories, cards, statements, transactions, and recurring bills'
);

select results_eq(
  $$
    select 'checking_accounts', count(*) from public.checking_accounts where user_id = '00000000-0000-4000-8000-000000000002'
    union all select 'account_categories', count(*) from public.account_categories where user_id = '00000000-0000-4000-8000-000000000002'
    union all select 'credit_cards', count(*) from public.credit_cards where user_id = '00000000-0000-4000-8000-000000000002'
    union all select 'card_categories', count(*) from public.card_categories where user_id = '00000000-0000-4000-8000-000000000002'
    union all select 'recurring_bills', count(*) from public.recurring_bills where user_id = '00000000-0000-4000-8000-000000000002'
    union all select 'card_statements', count(*) from public.card_statements where user_id = '00000000-0000-4000-8000-000000000002'
    union all select 'card_events', count(*) from public.card_events where user_id = '00000000-0000-4000-8000-000000000002'
    union all select 'account_transactions', count(*) from public.account_transactions where user_id = '00000000-0000-4000-8000-000000000002'
    union all select 'recurring_bill_occurrences', count(*) from public.recurring_bill_occurrences where user_id = '00000000-0000-4000-8000-000000000002'
    union all select 'invoice_payments', count(*) from public.invoice_payments where user_id = '00000000-0000-4000-8000-000000000002'
  $$,
  $$ select resource, total from other_person_rows $$,
  'deleting a person account does not erase another person data'
);

select is_empty(
  $$
    select p.oid::regprocedure::text
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prorettype <> 'trigger'::regtype
      and has_function_privilege('anon', p.oid, 'EXECUTE')
  $$,
  'anonymous callers cannot execute any public finance function'
);

select * from finish();
rollback;
