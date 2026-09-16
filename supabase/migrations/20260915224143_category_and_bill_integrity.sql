-- Category names are unique among active rows only, so archived names can be reused.
alter table public.account_categories drop constraint account_categories_user_id_name_key;
create unique index account_categories_active_name_key on public.account_categories (user_id, name) where archived_at is null;
alter table public.card_categories drop constraint card_categories_user_id_name_key;
create unique index card_categories_active_name_key on public.card_categories (user_id, name) where archived_at is null;
create unique index account_categories_one_active_system_key on public.account_categories (user_id) where is_system and archived_at is null;

-- The system category is maintained only by database commands.
drop policy "owners create account categories" on public.account_categories;
create policy "owners create account categories" on public.account_categories
for insert to authenticated with check ((select auth.uid()) = user_id and not is_system);
drop policy "owners update active account categories" on public.account_categories;
create policy "owners update active account categories" on public.account_categories
for update to authenticated
using ((select auth.uid()) = user_id and archived_at is null and not is_system)
with check ((select auth.uid()) = user_id and not is_system);

create or replace function private.ensure_starter_categories(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.account_categories (user_id, name, is_system)
  select p_user_id, category_name, category_name = 'Pagamento de fatura'
  from unnest(array[
    'Receitas',
    'Moradia',
    'Alimentação',
    'Transporte',
    'Saúde',
    'Lazer',
    'Pagamento de fatura',
    'Outros'
  ]::text[]) as category_name
  on conflict (user_id, name) where archived_at is null do nothing;

  insert into public.card_categories (user_id, name)
  select p_user_id, category_name
  from unnest(array[
    'Moradia',
    'Alimentação',
    'Transporte',
    'Saúde',
    'Lazer',
    'Compras',
    'Outros'
  ]::text[]) as category_name
  on conflict (user_id, name) where archived_at is null do nothing;
end;
$$;

create or replace function public.pay_card_statement(p_statement_id uuid, p_checking_account_id uuid, p_paid_on date)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_statement public.card_statements%rowtype;
  v_amount_cents integer;
  v_category_id uuid;
  v_transaction_id uuid;
  v_payment_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;
  select * into v_statement from public.card_statements where id = p_statement_id and user_id = v_user_id for update;
  if not found then raise exception 'Card statement not found.' using errcode = 'P0001'; end if;
  if v_statement.status <> 'closed' then raise exception 'Only closed unpaid statements can be paid.' using errcode = 'P0001'; end if;
  perform 1 from public.checking_accounts where id = p_checking_account_id and user_id = v_user_id and archived_at is null;
  if not found then raise exception 'Checking account not found.' using errcode = 'P0001'; end if;

  select coalesce(sum(case when event_type = 'chargeback' then -amount_cents else amount_cents end), 0)
  into v_amount_cents from public.card_events where card_statement_id = v_statement.id and user_id = v_user_id;
  if v_amount_cents <= 0 then raise exception 'Statement has no payable amount.' using errcode = 'P0001'; end if;

  -- Use the active system category; otherwise promote the active label, reactivate a legacy archived one, or create it.
  select id into v_category_id from public.account_categories
  where user_id = v_user_id and is_system and archived_at is null;

  if v_category_id is null then
    update public.account_categories set is_system = true
    where user_id = v_user_id and name = 'Pagamento de fatura' and archived_at is null
    returning id into v_category_id;
  end if;

  if v_category_id is null then
    update public.account_categories set archived_at = null
    where id = (
      select id from public.account_categories
      where user_id = v_user_id and is_system
      order by created_at
      limit 1
    )
    returning id into v_category_id;
  end if;

  if v_category_id is null then
    insert into public.account_categories (user_id, name, is_system)
    values (v_user_id, 'Pagamento de fatura', true)
    returning id into v_category_id;
  end if;

  insert into public.account_transactions (user_id, checking_account_id, account_category_id, transaction_type, description, amount_cents, occurred_on)
  values (v_user_id, p_checking_account_id, v_category_id, 'invoice_payment', 'Pagamento de fatura', v_amount_cents, p_paid_on)
  returning id into v_transaction_id;

  insert into public.invoice_payments (user_id, card_statement_id, checking_account_id, account_transaction_id, amount_cents, paid_on)
  values (v_user_id, v_statement.id, p_checking_account_id, v_transaction_id, v_amount_cents, p_paid_on)
  returning id into v_payment_id;

  update public.card_statements set status = 'paid', paid_at = now() where id = v_statement.id;
  return v_payment_id;
end;
$$;

create or replace function public.ensure_recurring_bill_occurrences(p_through_month date)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_bill public.recurring_bills%rowtype;
  v_month date;
  v_created integer := 0;
begin
  if v_user_id is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;
  for v_bill in
    select bill.* from public.recurring_bills as bill
    join public.checking_accounts as account on account.id = bill.checking_account_id and account.user_id = bill.user_id and account.archived_at is null
    join public.account_categories as category on category.id = bill.account_category_id and category.user_id = bill.user_id and category.archived_at is null
    where bill.user_id = v_user_id and bill.paused_at is null and bill.archived_at is null
  loop
    v_month := date_trunc('month', v_bill.start_date)::date;
    while v_month <= date_trunc('month', p_through_month)::date loop
      insert into public.recurring_bill_occurrences (user_id, recurring_bill_id, occurrence_month, due_date)
      values (v_user_id, v_bill.id, v_month, private.month_date(v_month, v_bill.due_day))
      on conflict (recurring_bill_id, occurrence_month) do nothing;
      if found then v_created := v_created + 1; end if;
      v_month := (v_month + interval '1 month')::date;
    end loop;
  end loop;
  return v_created;
end;
$$;
