begin;
create extension if not exists pgtap with schema extensions;
select plan(99);

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

select ok(not (has_table_privilege('anon', 'public.checking_accounts', 'SELECT') or has_table_privilege('anon', 'public.checking_accounts', 'INSERT') or has_table_privilege('anon', 'public.checking_accounts', 'UPDATE') or has_table_privilege('anon', 'public.checking_accounts', 'DELETE')), 'anonymous has no checking account operations');
select ok(not (has_table_privilege('anon', 'public.account_categories', 'SELECT') or has_table_privilege('anon', 'public.account_categories', 'INSERT') or has_table_privilege('anon', 'public.account_categories', 'UPDATE') or has_table_privilege('anon', 'public.account_categories', 'DELETE')), 'anonymous has no account category operations');
select ok(not (has_table_privilege('anon', 'public.credit_cards', 'SELECT') or has_table_privilege('anon', 'public.credit_cards', 'INSERT') or has_table_privilege('anon', 'public.credit_cards', 'UPDATE') or has_table_privilege('anon', 'public.credit_cards', 'DELETE')), 'anonymous has no credit card operations');
select ok(not (has_table_privilege('anon', 'public.card_categories', 'SELECT') or has_table_privilege('anon', 'public.card_categories', 'INSERT') or has_table_privilege('anon', 'public.card_categories', 'UPDATE') or has_table_privilege('anon', 'public.card_categories', 'DELETE')), 'anonymous has no card category operations');
select ok(not (has_table_privilege('anon', 'public.recurring_bills', 'SELECT') or has_table_privilege('anon', 'public.recurring_bills', 'INSERT') or has_table_privilege('anon', 'public.recurring_bills', 'UPDATE') or has_table_privilege('anon', 'public.recurring_bills', 'DELETE')), 'anonymous has no recurring bill operations');
select ok(not (has_table_privilege('anon', 'public.account_transactions', 'SELECT') or has_table_privilege('anon', 'public.account_transactions', 'INSERT') or has_table_privilege('anon', 'public.account_transactions', 'UPDATE') or has_table_privilege('anon', 'public.account_transactions', 'DELETE')), 'anonymous has no account transaction operations');
select ok(not (has_table_privilege('anon', 'public.recurring_bill_occurrences', 'SELECT') or has_table_privilege('anon', 'public.recurring_bill_occurrences', 'INSERT') or has_table_privilege('anon', 'public.recurring_bill_occurrences', 'UPDATE') or has_table_privilege('anon', 'public.recurring_bill_occurrences', 'DELETE')), 'anonymous has no recurring occurrence operations');
select ok(not (has_table_privilege('anon', 'public.card_statements', 'SELECT') or has_table_privilege('anon', 'public.card_statements', 'INSERT') or has_table_privilege('anon', 'public.card_statements', 'UPDATE') or has_table_privilege('anon', 'public.card_statements', 'DELETE')), 'anonymous has no card statement operations');
select ok(not (has_table_privilege('anon', 'public.card_events', 'SELECT') or has_table_privilege('anon', 'public.card_events', 'INSERT') or has_table_privilege('anon', 'public.card_events', 'UPDATE') or has_table_privilege('anon', 'public.card_events', 'DELETE')), 'anonymous has no card event operations');
select ok(not (has_table_privilege('anon', 'public.invoice_payments', 'SELECT') or has_table_privilege('anon', 'public.invoice_payments', 'INSERT') or has_table_privilege('anon', 'public.invoice_payments', 'UPDATE') or has_table_privilege('anon', 'public.invoice_payments', 'DELETE')), 'anonymous has no invoice payment operations');

select ok(not has_function_privilege('anon', 'public.create_card_purchase(uuid,uuid,text,integer,date)', 'EXECUTE'), 'anonymous cannot create card purchases');
select ok(not has_function_privilege('anon', 'public.create_installment_purchase(uuid,uuid,text,integer,smallint,date)', 'EXECUTE'), 'anonymous cannot create installment purchases');
select ok(not has_function_privilege('anon', 'public.create_chargeback(uuid,uuid,text,integer,date,uuid)', 'EXECUTE'), 'anonymous cannot create chargebacks');
select ok(not has_function_privilege('anon', 'public.ensure_recurring_bill_occurrences(date)', 'EXECUTE'), 'anonymous cannot generate recurring occurrences');
select ok(not has_function_privilege('anon', 'public.mark_recurring_bill_paid(uuid,date)', 'EXECUTE'), 'anonymous cannot pay recurring bills');
select ok(not has_function_privilege('anon', 'public.skip_recurring_bill_occurrence(uuid)', 'EXECUTE'), 'anonymous cannot skip recurring bills');
select ok(not has_function_privilege('anon', 'public.close_due_card_statements(date)', 'EXECUTE'), 'anonymous cannot close statements');
select ok(not has_function_privilege('anon', 'public.pay_card_statement(uuid,uuid,date)', 'EXECUTE'), 'anonymous cannot pay statements');

select ok(not has_table_privilege('authenticated', 'public.checking_accounts', 'DELETE'), 'checking accounts are archived, not deleted directly');
select ok(not has_table_privilege('authenticated', 'public.account_categories', 'DELETE'), 'account categories are archived, not deleted directly');
select ok(not has_table_privilege('authenticated', 'public.credit_cards', 'DELETE'), 'credit cards are archived, not deleted directly');
select ok(not has_table_privilege('authenticated', 'public.card_categories', 'DELETE'), 'card categories are archived, not deleted directly');
select ok(not has_table_privilege('authenticated', 'public.recurring_bills', 'DELETE'), 'recurring bills are archived, not deleted directly');

select ok(has_table_privilege('authenticated', 'public.account_transactions', 'INSERT'), 'manual account transactions can be inserted directly');
select ok(not has_table_privilege('authenticated', 'public.account_transactions', 'UPDATE'), 'account transactions cannot be updated directly');
select ok(not has_table_privilege('authenticated', 'public.account_transactions', 'DELETE'), 'account transactions cannot be deleted directly');
select ok(not has_table_privilege('authenticated', 'public.recurring_bill_occurrences', 'INSERT'), 'recurring occurrences cannot be inserted directly');
select ok(not has_table_privilege('authenticated', 'public.recurring_bill_occurrences', 'UPDATE'), 'recurring occurrences cannot be updated directly');
select ok(not has_table_privilege('authenticated', 'public.recurring_bill_occurrences', 'DELETE'), 'recurring occurrences cannot be deleted directly');
select ok(not has_table_privilege('authenticated', 'public.card_statements', 'INSERT'), 'card statements cannot be inserted directly');
select ok(not has_table_privilege('authenticated', 'public.card_statements', 'UPDATE'), 'card statements cannot be updated directly');
select ok(not has_table_privilege('authenticated', 'public.card_statements', 'DELETE'), 'card statements cannot be deleted directly');
select ok(not has_table_privilege('authenticated', 'public.card_events', 'INSERT'), 'card events cannot be inserted directly');
select ok(not has_table_privilege('authenticated', 'public.card_events', 'UPDATE'), 'card events cannot be updated directly');
select ok(not has_table_privilege('authenticated', 'public.card_events', 'DELETE'), 'card events cannot be deleted directly');
select ok(not has_table_privilege('authenticated', 'public.invoice_payments', 'INSERT'), 'invoice payments cannot be inserted directly');
select ok(not has_table_privilege('authenticated', 'public.invoice_payments', 'UPDATE'), 'invoice payments cannot be updated directly');
select ok(not has_table_privilege('authenticated', 'public.invoice_payments', 'DELETE'), 'invoice payments cannot be deleted directly');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';

select results_eq(
  $$
    select * from (values
      ('account_categories', (select count(*) from public.account_categories), (select count(*) from public.account_categories where user_id <> auth.uid())),
      ('account_transactions', (select count(*) from public.account_transactions), (select count(*) from public.account_transactions where user_id <> auth.uid())),
      ('card_categories', (select count(*) from public.card_categories), (select count(*) from public.card_categories where user_id <> auth.uid())),
      ('card_events', (select count(*) from public.card_events), (select count(*) from public.card_events where user_id <> auth.uid())),
      ('card_statements', (select count(*) from public.card_statements), (select count(*) from public.card_statements where user_id <> auth.uid())),
      ('checking_accounts', (select count(*) from public.checking_accounts), (select count(*) from public.checking_accounts where user_id <> auth.uid())),
      ('credit_cards', (select count(*) from public.credit_cards), (select count(*) from public.credit_cards where user_id <> auth.uid())),
      ('invoice_payments', (select count(*) from public.invoice_payments), (select count(*) from public.invoice_payments where user_id <> auth.uid())),
      ('recurring_bill_occurrences', (select count(*) from public.recurring_bill_occurrences), (select count(*) from public.recurring_bill_occurrences where user_id <> auth.uid())),
      ('recurring_bills', (select count(*) from public.recurring_bills), (select count(*) from public.recurring_bills where user_id <> auth.uid()))
    ) as observed(resource, visible_rows, foreign_rows)
    order by resource
  $$,
  $$ values
    ('account_categories', 9::bigint, 0::bigint),
    ('account_transactions', 1::bigint, 0::bigint),
    ('card_categories', 8::bigint, 0::bigint),
    ('card_events', 2::bigint, 0::bigint),
    ('card_statements', 3::bigint, 0::bigint),
    ('checking_accounts', 1::bigint, 0::bigint),
    ('credit_cards', 1::bigint, 0::bigint),
    ('invoice_payments', 1::bigint, 0::bigint),
    ('recurring_bill_occurrences', 2::bigint, 0::bigint),
    ('recurring_bills', 1::bigint, 0::bigint)
  $$,
  'owner sees every own resource and no foreign rows'
);

select results_eq($$ insert into public.checking_accounts (user_id, name) values ('00000000-0000-4000-8000-000000000001', 'Extra account') returning name $$, $$ values ('Extra account'::text) $$, 'owner creates a checking account');
select results_eq($$ update public.checking_accounts set name = 'Renamed account' where name = 'Extra account' returning name $$, $$ values ('Renamed account'::text) $$, 'owner updates a checking account');
select results_eq($$ insert into public.account_categories (user_id, name) values ('00000000-0000-4000-8000-000000000001', 'Extra account category') returning name $$, $$ values ('Extra account category'::text) $$, 'owner creates an account category');
select results_eq($$ update public.account_categories set name = 'Renamed account category' where name = 'Extra account category' returning name $$, $$ values ('Renamed account category'::text) $$, 'owner updates an account category');
select results_eq($$ insert into public.credit_cards (user_id, name, credit_limit_cents, closing_day, due_day, points_per_usd, brl_per_usd) values ('00000000-0000-4000-8000-000000000001', 'Extra card', 100000, 10, 17, 1.5, 5.5) returning name $$, $$ values ('Extra card'::text) $$, 'owner creates a credit card');
select results_eq($$ update public.credit_cards set name = 'Renamed card' where name = 'Extra card' returning name $$, $$ values ('Renamed card'::text) $$, 'owner updates a credit card');
select results_eq($$ insert into public.card_categories (user_id, name) values ('00000000-0000-4000-8000-000000000001', 'Extra card category') returning name $$, $$ values ('Extra card category'::text) $$, 'owner creates a card category');
select results_eq($$ update public.card_categories set name = 'Renamed card category' where name = 'Extra card category' returning name $$, $$ values ('Renamed card category'::text) $$, 'owner updates a card category');
select results_eq($$ insert into public.recurring_bills (user_id, checking_account_id, account_category_id, description, amount_cents, due_day, start_date) values ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Extra bill', 3000, 7, '2026-02-01') returning description $$, $$ values ('Extra bill'::text) $$, 'owner creates a recurring bill');
select results_eq($$ update public.recurring_bills set description = 'Renamed bill' where description = 'Extra bill' returning description $$, $$ values ('Renamed bill'::text) $$, 'owner updates a recurring bill');
select results_eq(
  $$ with inserted as (
    insert into public.account_transactions (user_id, checking_account_id, account_category_id, transaction_type, description, amount_cents, occurred_on) values
      ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'income', 'Manual income', 4500, '2026-02-10'),
      ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'expense', 'Manual expense', 1200, '2026-02-11')
    returning transaction_type::text as transaction_type
  ) select transaction_type from inserted order by transaction_type $$,
  $$ values ('expense'::text), ('income'::text) $$,
  'owner creates only supported manual account transaction types'
);
select throws_matching($$ insert into public.account_transactions (user_id, checking_account_id, account_category_id, transaction_type, description, amount_cents, occurred_on) values ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'invoice_payment', 'Forged system transaction', 1200, '2026-02-11') $$, 'row-level security', 'owner cannot forge a system account transaction');

select results_eq($$ update public.checking_accounts set archived_at = now() where name = 'Renamed account' returning name $$, $$ values ('Renamed account'::text) $$, 'owner archives an active checking account');
select is_empty($$ update public.checking_accounts set name = 'Reactivated account', archived_at = null where name = 'Renamed account' returning id $$, 'owner cannot edit or reactivate an archived checking account');
select results_eq($$ update public.account_categories set archived_at = now() where name = 'Renamed account category' returning name $$, $$ values ('Renamed account category'::text) $$, 'owner archives an active account category');
select is_empty($$ update public.account_categories set name = 'Reactivated account category', archived_at = null where name = 'Renamed account category' returning id $$, 'owner cannot edit or reactivate an archived account category');
select throws_matching($$ insert into public.account_transactions (user_id, checking_account_id, account_category_id, transaction_type, description, amount_cents, occurred_on) select '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', id, 'expense', 'Archived category expense', 1000, '2026-02-12' from public.account_categories where name = 'Renamed account category' $$, 'active account category', 'manual transactions reject an archived category');
select throws_matching($$ insert into public.recurring_bills (user_id, checking_account_id, account_category_id, description, amount_cents, due_day, start_date) select '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', id, 'Archived category bill', 1000, 8, '2026-02-01' from public.account_categories where name = 'Renamed account category' $$, 'active account category', 'recurring bills reject an archived category');
select results_eq($$ update public.credit_cards set archived_at = now() where name = 'Renamed card' returning name $$, $$ values ('Renamed card'::text) $$, 'owner archives an active credit card');
select is_empty($$ update public.credit_cards set name = 'Reactivated card', archived_at = null where name = 'Renamed card' returning id $$, 'owner cannot edit or reactivate an archived credit card');
select results_eq($$ update public.card_categories set archived_at = now() where name = 'Renamed card category' returning name $$, $$ values ('Renamed card category'::text) $$, 'owner archives an active card category');
select is_empty($$ update public.card_categories set name = 'Reactivated card category', archived_at = null where name = 'Renamed card category' returning id $$, 'owner cannot edit or reactivate an archived card category');

select throws_matching($$ insert into public.checking_accounts (user_id, name) values ('00000000-0000-4000-8000-000000000002', 'Foreign account') $$, 'row-level security', 'owner cannot create a checking account for another user');
select is_empty($$ update public.checking_accounts set name = 'Hacked account' where id = '10000000-0000-4000-8000-000000000002' returning id $$, 'owner cannot update another user checking account');
select throws_matching($$ insert into public.account_categories (user_id, name) values ('00000000-0000-4000-8000-000000000002', 'Foreign account category') $$, 'row-level security', 'owner cannot create an account category for another user');
select is_empty($$ update public.account_categories set name = 'Hacked account category' where id = '20000000-0000-4000-8000-000000000002' returning id $$, 'owner cannot update another user account category');
select throws_matching($$ insert into public.credit_cards (user_id, name, credit_limit_cents, closing_day, due_day, points_per_usd, brl_per_usd) values ('00000000-0000-4000-8000-000000000002', 'Foreign card', 100000, 10, 17, 1.5, 5.5) $$, 'row-level security', 'owner cannot create a credit card for another user');
select is_empty($$ update public.credit_cards set name = 'Hacked card' where id = '30000000-0000-4000-8000-000000000002' returning id $$, 'owner cannot update another user credit card');
select throws_matching($$ insert into public.card_categories (user_id, name) values ('00000000-0000-4000-8000-000000000002', 'Foreign card category') $$, 'row-level security', 'owner cannot create a card category for another user');
select is_empty($$ update public.card_categories set name = 'Hacked card category' where id = '40000000-0000-4000-8000-000000000002' returning id $$, 'owner cannot update another user card category');
select throws_matching($$ insert into public.recurring_bills (user_id, checking_account_id, account_category_id, description, amount_cents, due_day, start_date) values ('00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Foreign bill', 3000, 7, '2026-02-01') $$, 'row-level security', 'owner cannot create a recurring bill for another user');
select is_empty($$ update public.recurring_bills set description = 'Hacked bill' where id = '50000000-0000-4000-8000-000000000002' returning id $$, 'owner cannot update another user recurring bill');
select throws_matching($$ insert into public.account_transactions (user_id, checking_account_id, account_category_id, transaction_type, description, amount_cents, occurred_on) values ('00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'income', 'Foreign manual income', 1000, '2026-02-10') $$, 'row-level security', 'owner cannot create a manual transaction for another user');
select throws_matching($$ insert into public.recurring_bills (user_id, checking_account_id, account_category_id, description, amount_cents, due_day, start_date) values ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'Foreign account link', 3000, 7, '2026-02-01') $$, 'active checking account', 'owner cannot create a recurring bill with another user account');
select throws_matching($$ insert into public.recurring_bills (user_id, checking_account_id, account_category_id, description, amount_cents, due_day, start_date) values ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'Foreign category link', 3000, 7, '2026-02-01') $$, 'active account category', 'owner cannot create a recurring bill with another user category');
select throws_matching($$ update public.recurring_bills set checking_account_id = '10000000-0000-4000-8000-000000000002' where id = '50000000-0000-4000-8000-000000000001' $$, 'active checking account', 'owner cannot update a recurring bill to another user account');
select throws_matching($$ update public.recurring_bills set account_category_id = '20000000-0000-4000-8000-000000000002' where id = '50000000-0000-4000-8000-000000000001' $$, 'active account category', 'owner cannot update a recurring bill to another user category');

select ok(public.create_card_purchase('30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Allowed purchase', 1000, '2026-06-01') is not null, 'owner creates a card purchase command');
select is(cardinality(public.create_installment_purchase('30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Allowed installment', 2001, 2::smallint, '2026-07-01')), 2, 'owner creates every installment atomically');
select ok(public.create_chargeback('30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Allowed chargeback', 500, '2026-09-01') is not null, 'owner creates a chargeback command');
select ok(public.mark_recurring_bill_paid('90000000-0000-4000-8000-000000000001', '2026-01-05') is not null, 'owner pays a pending recurring occurrence');
select throws_ok($$ select public.mark_recurring_bill_paid('90000000-0000-4000-8000-000000000001', '2026-01-05') $$, 'P0001', 'Recurring bill occurrence is no longer pending.', 'duplicate recurring payment is rejected');
select public.skip_recurring_bill_occurrence('90000000-0000-4000-8000-000000000011');
select results_eq(
  $$ select status::text from public.recurring_bill_occurrences where id = '90000000-0000-4000-8000-000000000011' $$,
  $$ values ('skipped'::text) $$,
  'owner skips a pending recurring occurrence'
);
select is(public.ensure_recurring_bill_occurrences('2026-02-01'), 2, 'owner generates only their missing recurring occurrences');

reset role;
select is((select count(*) from public.recurring_bill_occurrences where user_id = '00000000-0000-4000-8000-000000000002'), 1::bigint, 'recurring generation does not touch another user');
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';

select is(public.close_due_card_statements('2026-03-31'), 1, 'owner closes only their due statement');
reset role;
select is((select status::text from public.card_statements where id = '60000000-0000-4000-8000-000000000022'), 'open', 'statement closing does not touch another user');
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';

select throws_ok($$ select public.pay_card_statement('60000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000002', '2026-01-18') $$, 'P0001', 'Checking account not found.', 'owner cannot pay their statement from another user account');
select ok(public.pay_card_statement('60000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001', '2026-01-17') is not null, 'owner pays a closed statement');
select throws_ok($$ select public.pay_card_statement('60000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001', '2026-01-17') $$, 'P0001', 'Only closed unpaid statements can be paid.', 'duplicate statement payment is rejected');

select throws_ok($$ select public.create_card_purchase('30000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'Foreign purchase', 1000, '2026-06-01') $$, 'P0001', 'Credit card not found.', 'owner cannot purchase on another user card');
select throws_ok($$ select public.create_installment_purchase('30000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'Foreign installment', 2000, 2::smallint, '2026-07-01') $$, 'P0001', 'Credit card not found.', 'owner cannot create installments on another user card');
select throws_ok($$ select public.create_chargeback('30000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'Foreign chargeback', 500, '2026-09-01') $$, 'P0001', 'Credit card not found.', 'owner cannot create a chargeback on another user card');
select throws_ok($$ select public.create_chargeback('30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Foreign parent', 500, '2026-09-01', '70000000-0000-4000-8000-000000000002') $$, 'P0001', 'Original card event not found.', 'owner cannot link a chargeback to another user event');
select throws_ok($$ select public.create_card_purchase('30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', 'Foreign category purchase', 1000, '2026-06-01') $$, 'P0001', 'Card category not found.', 'owner cannot purchase with another user category');
select throws_ok($$ select public.create_installment_purchase('30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', 'Foreign category installment', 2000, 2::smallint, '2026-07-01') $$, 'P0001', 'Card category not found.', 'owner cannot create installments with another user category');
select throws_ok($$ select public.create_chargeback('30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', 'Foreign category chargeback', 500, '2026-09-01') $$, 'P0001', 'Card category not found.', 'owner cannot create a chargeback with another user category');
select throws_ok($$ select public.mark_recurring_bill_paid('90000000-0000-4000-8000-000000000002', '2026-01-06') $$, 'P0001', 'Recurring bill occurrence not found.', 'owner cannot pay another user recurring occurrence');
select throws_ok($$ select public.skip_recurring_bill_occurrence('90000000-0000-4000-8000-000000000002') $$, 'P0001', 'Recurring bill occurrence is not pending.', 'owner cannot skip another user recurring occurrence');
select throws_ok($$ select public.pay_card_statement('60000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000002', '2026-01-18') $$, 'P0001', 'Card statement not found.', 'owner cannot pay another user statement');

select * from finish();
rollback;
