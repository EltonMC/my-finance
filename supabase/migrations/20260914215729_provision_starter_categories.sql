create function private.ensure_starter_categories(p_user_id uuid)
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
  on conflict (user_id, name) do nothing;

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
  on conflict (user_id, name) do nothing;

end;
$$;

create function private.provision_starter_categories()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.ensure_starter_categories(new.id);
  return new;
end;
$$;

revoke all on function private.ensure_starter_categories(uuid) from public;
revoke all on function private.provision_starter_categories() from public;

create trigger provision_starter_categories_after_user_created
after insert on auth.users
for each row execute function private.provision_starter_categories();

select private.ensure_starter_categories(id) from auth.users;

create function private.require_active_account_links()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform 1 from public.checking_accounts
  where id = new.checking_account_id and user_id = new.user_id and archived_at is null;
  if not found then
    raise exception 'An active checking account is required.' using errcode = '23514';
  end if;

  perform 1 from public.account_categories
  where id = new.account_category_id and user_id = new.user_id and archived_at is null;
  if not found then
    raise exception 'An active account category is required.' using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.require_active_account_links() from public;

create trigger require_active_account_transaction_links
before insert or update of user_id, checking_account_id, account_category_id on public.account_transactions
for each row execute function private.require_active_account_links();

create trigger require_active_recurring_bill_links
before insert or update of user_id, checking_account_id, account_category_id on public.recurring_bills
for each row execute function private.require_active_account_links();

create function public.get_checking_account_balances()
returns table (
  id uuid,
  name text,
  institution text,
  opening_balance_cents integer,
  balance_cents bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    account.id,
    account.name,
    account.institution,
    account.opening_balance_cents,
    account.opening_balance_cents::bigint + coalesce(sum(
      case when transaction.transaction_type = 'income'
        then transaction.amount_cents::bigint
        else -transaction.amount_cents::bigint
      end
    ), 0::bigint) as balance_cents
  from public.checking_accounts as account
  left join public.account_transactions as transaction
    on transaction.checking_account_id = account.id
    and transaction.user_id = account.user_id
  where account.user_id = (select auth.uid())
    and account.archived_at is null
  group by account.id, account.name, account.institution, account.opening_balance_cents, account.created_at
  order by account.created_at;
$$;

revoke all on function public.get_checking_account_balances() from public;
revoke execute on function public.get_checking_account_balances() from anon;
grant execute on function public.get_checking_account_balances() to authenticated;

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

  insert into public.account_categories (user_id, name, is_system)
  values (v_user_id, 'Pagamento de fatura', true)
  on conflict (user_id, name) do update set is_system = true, archived_at = null
  returning id into v_category_id;

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
