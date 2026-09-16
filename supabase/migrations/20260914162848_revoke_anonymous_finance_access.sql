revoke all on table
  public.checking_accounts,
  public.account_categories,
  public.credit_cards,
  public.card_categories,
  public.recurring_bills,
  public.account_transactions,
  public.recurring_bill_occurrences,
  public.card_statements,
  public.card_events,
  public.invoice_payments
from anon;

revoke delete on table
  public.checking_accounts,
  public.account_categories,
  public.credit_cards,
  public.card_categories,
  public.recurring_bills
from authenticated;

revoke insert, update, delete on table
  public.recurring_bill_occurrences,
  public.card_statements,
  public.card_events,
  public.invoice_payments
from authenticated;

revoke update, delete on table public.account_transactions from authenticated;
grant insert on table public.account_transactions to authenticated;

drop policy "owners manage checking accounts" on public.checking_accounts;
drop policy "owners manage account categories" on public.account_categories;
drop policy "owners manage credit cards" on public.credit_cards;
drop policy "owners manage card categories" on public.card_categories;

create policy "owners read checking accounts" on public.checking_accounts
for select to authenticated using ((select auth.uid()) = user_id);
create policy "owners create checking accounts" on public.checking_accounts
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "owners update active checking accounts" on public.checking_accounts
for update to authenticated
using ((select auth.uid()) = user_id and archived_at is null)
with check ((select auth.uid()) = user_id);

create policy "owners read account categories" on public.account_categories
for select to authenticated using ((select auth.uid()) = user_id);
create policy "owners create account categories" on public.account_categories
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "owners update active account categories" on public.account_categories
for update to authenticated
using ((select auth.uid()) = user_id and archived_at is null)
with check ((select auth.uid()) = user_id);

create policy "owners read credit cards" on public.credit_cards
for select to authenticated using ((select auth.uid()) = user_id);
create policy "owners create credit cards" on public.credit_cards
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "owners update active credit cards" on public.credit_cards
for update to authenticated
using ((select auth.uid()) = user_id and archived_at is null)
with check ((select auth.uid()) = user_id);

create policy "owners read card categories" on public.card_categories
for select to authenticated using ((select auth.uid()) = user_id);
create policy "owners create card categories" on public.card_categories
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "owners update active card categories" on public.card_categories
for update to authenticated
using ((select auth.uid()) = user_id and archived_at is null)
with check ((select auth.uid()) = user_id);

create policy "owners create manual account transactions" on public.account_transactions
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and transaction_type in ('income', 'expense')
);

revoke execute on function public.create_card_purchase(uuid, uuid, text, integer, date) from anon;
revoke execute on function public.create_installment_purchase(uuid, uuid, text, integer, smallint, date) from anon;
revoke execute on function public.create_chargeback(uuid, uuid, text, integer, date, uuid) from anon;
revoke execute on function public.ensure_recurring_bill_occurrences(date) from anon;
revoke execute on function public.mark_recurring_bill_paid(uuid, date) from anon;
revoke execute on function public.skip_recurring_bill_occurrence(uuid) from anon;
revoke execute on function public.close_due_card_statements(date) from anon;
revoke execute on function public.pay_card_statement(uuid, uuid, date) from anon;
