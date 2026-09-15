create schema if not exists private;

create type public.account_transaction_type as enum (
  'income',
  'expense',
  'recurring_bill_payment',
  'invoice_payment'
);

create type public.recurring_occurrence_status as enum ('pending', 'paid', 'skipped');
create type public.card_statement_status as enum ('open', 'closed', 'paid');
create type public.card_event_type as enum ('purchase', 'installment', 'chargeback');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.checking_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 80),
  institution text check (institution is null or char_length(trim(institution)) between 1 and 80),
  opening_balance_cents integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.account_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 80),
  is_system boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name),
  unique (id, user_id)
);

create table public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 80),
  issuer text check (issuer is null or char_length(trim(issuer)) between 1 and 80),
  credit_limit_cents integer not null check (credit_limit_cents > 0),
  closing_day smallint not null check (closing_day between 1 and 31),
  due_day smallint not null check (due_day between 1 and 31),
  points_per_usd numeric(12, 4) not null check (points_per_usd > 0),
  brl_per_usd numeric(12, 4) not null check (brl_per_usd > 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.card_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 80),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name),
  unique (id, user_id)
);

create table public.recurring_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  checking_account_id uuid not null,
  account_category_id uuid not null,
  description text not null check (char_length(trim(description)) between 1 and 140),
  amount_cents integer not null check (amount_cents > 0),
  due_day smallint not null check (due_day between 1 and 31),
  start_date date not null,
  paused_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (checking_account_id, user_id) references public.checking_accounts (id, user_id) on delete restrict,
  foreign key (account_category_id, user_id) references public.account_categories (id, user_id) on delete restrict
);

create table public.card_statements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  credit_card_id uuid not null,
  statement_month date not null check (extract(day from statement_month) = 1),
  closing_date date not null,
  due_date date not null,
  status public.card_statement_status not null default 'open',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (credit_card_id, statement_month),
  foreign key (credit_card_id, user_id) references public.credit_cards (id, user_id) on delete restrict,
  check ((status = 'paid') = (paid_at is not null))
);

create table public.card_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  credit_card_id uuid not null,
  card_statement_id uuid not null,
  card_category_id uuid not null,
  parent_card_event_id uuid,
  event_type public.card_event_type not null,
  description text not null check (char_length(trim(description)) between 1 and 140),
  amount_cents integer not null check (amount_cents > 0),
  occurred_on date not null,
  points_per_usd_snapshot numeric(12, 4) not null check (points_per_usd_snapshot > 0),
  brl_per_usd_snapshot numeric(12, 4) not null check (brl_per_usd_snapshot > 0),
  created_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (credit_card_id, user_id) references public.credit_cards (id, user_id) on delete restrict,
  foreign key (card_statement_id, user_id) references public.card_statements (id, user_id) on delete restrict,
  foreign key (card_category_id, user_id) references public.card_categories (id, user_id) on delete restrict,
  foreign key (parent_card_event_id, user_id) references public.card_events (id, user_id) on delete restrict
);

create table public.account_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  checking_account_id uuid not null,
  account_category_id uuid not null,
  transaction_type public.account_transaction_type not null,
  description text not null check (char_length(trim(description)) between 1 and 140),
  amount_cents integer not null check (amount_cents > 0),
  occurred_on date not null,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (checking_account_id, user_id) references public.checking_accounts (id, user_id) on delete restrict,
  foreign key (account_category_id, user_id) references public.account_categories (id, user_id) on delete restrict
);

create table public.recurring_bill_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  recurring_bill_id uuid not null,
  occurrence_month date not null check (extract(day from occurrence_month) = 1),
  due_date date not null,
  status public.recurring_occurrence_status not null default 'pending',
  account_transaction_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (recurring_bill_id, occurrence_month),
  foreign key (recurring_bill_id, user_id) references public.recurring_bills (id, user_id) on delete restrict,
  foreign key (account_transaction_id, user_id) references public.account_transactions (id, user_id) on delete restrict,
  check ((status = 'paid') = (account_transaction_id is not null))
);

create table public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  card_statement_id uuid not null,
  checking_account_id uuid not null,
  account_transaction_id uuid not null,
  amount_cents integer not null check (amount_cents > 0),
  paid_on date not null,
  created_at timestamptz not null default now(),
  unique (card_statement_id),
  unique (id, user_id),
  foreign key (card_statement_id, user_id) references public.card_statements (id, user_id) on delete restrict,
  foreign key (checking_account_id, user_id) references public.checking_accounts (id, user_id) on delete restrict,
  foreign key (account_transaction_id, user_id) references public.account_transactions (id, user_id) on delete restrict
);

create index checking_accounts_user_id_idx on public.checking_accounts (user_id) where archived_at is null;
create index account_categories_user_id_idx on public.account_categories (user_id) where archived_at is null;
create index credit_cards_user_id_idx on public.credit_cards (user_id) where archived_at is null;
create index card_categories_user_id_idx on public.card_categories (user_id) where archived_at is null;
create index recurring_bills_user_id_idx on public.recurring_bills (user_id) where archived_at is null;
create index account_transactions_account_date_idx on public.account_transactions (checking_account_id, occurred_on desc);
create index recurring_occurrences_user_due_idx on public.recurring_bill_occurrences (user_id, due_date);
create index card_statements_card_closing_idx on public.card_statements (credit_card_id, closing_date desc);
create index card_events_statement_date_idx on public.card_events (card_statement_id, occurred_on desc);
create index card_events_card_date_idx on public.card_events (credit_card_id, occurred_on desc);
create index invoice_payments_user_id_idx on public.invoice_payments (user_id);

create trigger checking_accounts_set_updated_at before update on public.checking_accounts for each row execute function public.set_updated_at();
create trigger account_categories_set_updated_at before update on public.account_categories for each row execute function public.set_updated_at();
create trigger credit_cards_set_updated_at before update on public.credit_cards for each row execute function public.set_updated_at();
create trigger card_categories_set_updated_at before update on public.card_categories for each row execute function public.set_updated_at();
create trigger recurring_bills_set_updated_at before update on public.recurring_bills for each row execute function public.set_updated_at();
create trigger card_statements_set_updated_at before update on public.card_statements for each row execute function public.set_updated_at();
create trigger recurring_bill_occurrences_set_updated_at before update on public.recurring_bill_occurrences for each row execute function public.set_updated_at();

alter table public.checking_accounts enable row level security;
alter table public.account_categories enable row level security;
alter table public.credit_cards enable row level security;
alter table public.card_categories enable row level security;
alter table public.recurring_bills enable row level security;
alter table public.account_transactions enable row level security;
alter table public.recurring_bill_occurrences enable row level security;
alter table public.card_statements enable row level security;
alter table public.card_events enable row level security;
alter table public.invoice_payments enable row level security;

grant select, insert, update on public.checking_accounts, public.account_categories, public.credit_cards, public.card_categories, public.recurring_bills to authenticated;
grant select on public.account_transactions, public.recurring_bill_occurrences, public.card_statements, public.card_events, public.invoice_payments to authenticated;

create policy "owners manage checking accounts" on public.checking_accounts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage account categories" on public.account_categories for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage credit cards" on public.credit_cards for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage card categories" on public.card_categories for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage recurring bills" on public.recurring_bills for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners read account transactions" on public.account_transactions for select to authenticated using ((select auth.uid()) = user_id);
create policy "owners read recurring bill occurrences" on public.recurring_bill_occurrences for select to authenticated using ((select auth.uid()) = user_id);
create policy "owners read card statements" on public.card_statements for select to authenticated using ((select auth.uid()) = user_id);
create policy "owners read card events" on public.card_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "owners read invoice payments" on public.invoice_payments for select to authenticated using ((select auth.uid()) = user_id);

create function private.month_date(p_reference date, p_day smallint)
returns date
language sql
immutable
set search_path = ''
as $$
  select (date_trunc('month', p_reference)::date + (least(p_day, extract(day from (date_trunc('month', p_reference) + interval '1 month - 1 day'))::smallint) - 1));
$$;

create function private.statement_for_card_event(p_card_id uuid, p_user_id uuid, p_occurred_on date)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card public.credit_cards%rowtype;
  v_statement_month date;
  v_statement_id uuid;
begin
  select * into v_card from public.credit_cards where id = p_card_id and user_id = p_user_id and archived_at is null;
  if not found then
    raise exception 'Credit card not found.' using errcode = 'P0001';
  end if;

  v_statement_month := date_trunc('month', p_occurred_on)::date;
  if extract(day from p_occurred_on)::smallint > v_card.closing_day then
    v_statement_month := (v_statement_month + interval '1 month')::date;
  end if;

  insert into public.card_statements (user_id, credit_card_id, statement_month, closing_date, due_date)
  values (
    p_user_id,
    p_card_id,
    v_statement_month,
    private.month_date(v_statement_month, v_card.closing_day),
    private.month_date(v_statement_month, v_card.due_day)
  )
  on conflict (credit_card_id, statement_month) do update set credit_card_id = excluded.credit_card_id
  returning id into v_statement_id;

  return v_statement_id;
end;
$$;

revoke all on function private.month_date(date, smallint) from public;
revoke all on function private.statement_for_card_event(uuid, uuid, date) from public;

create function public.create_card_purchase(
  p_credit_card_id uuid,
  p_card_category_id uuid,
  p_description text,
  p_amount_cents integer,
  p_occurred_on date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_card public.credit_cards%rowtype;
  v_statement_id uuid;
  v_event_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;
  if p_amount_cents <= 0 then raise exception 'Amount must be positive.' using errcode = '22023'; end if;

  select * into v_card from public.credit_cards where id = p_credit_card_id and user_id = v_user_id and archived_at is null;
  if not found then raise exception 'Credit card not found.' using errcode = 'P0001'; end if;
  perform 1 from public.card_categories where id = p_card_category_id and user_id = v_user_id and archived_at is null;
  if not found then raise exception 'Card category not found.' using errcode = 'P0001'; end if;

  v_statement_id := private.statement_for_card_event(p_credit_card_id, v_user_id, p_occurred_on);
  insert into public.card_events (user_id, credit_card_id, card_statement_id, card_category_id, event_type, description, amount_cents, occurred_on, points_per_usd_snapshot, brl_per_usd_snapshot)
  values (v_user_id, p_credit_card_id, v_statement_id, p_card_category_id, 'purchase', trim(p_description), p_amount_cents, p_occurred_on, v_card.points_per_usd, v_card.brl_per_usd)
  returning id into v_event_id;
  return v_event_id;
end;
$$;

create function public.create_installment_purchase(
  p_credit_card_id uuid,
  p_card_category_id uuid,
  p_description text,
  p_total_cents integer,
  p_installment_count smallint,
  p_occurred_on date
)
returns uuid[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_card public.credit_cards%rowtype;
  v_base_cents integer;
  v_event_cents integer;
  v_statement_id uuid;
  v_event_id uuid;
  v_event_ids uuid[] := array[]::uuid[];
  v_occurrence_date date;
begin
  if v_user_id is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;
  if p_total_cents <= 0 or p_installment_count < 1 then raise exception 'Installment values are invalid.' using errcode = '22023'; end if;
  select * into v_card from public.credit_cards where id = p_credit_card_id and user_id = v_user_id and archived_at is null;
  if not found then raise exception 'Credit card not found.' using errcode = 'P0001'; end if;
  perform 1 from public.card_categories where id = p_card_category_id and user_id = v_user_id and archived_at is null;
  if not found then raise exception 'Card category not found.' using errcode = 'P0001'; end if;

  v_base_cents := floor(p_total_cents::numeric / p_installment_count)::integer;
  for v_index in 1..p_installment_count loop
    v_event_cents := case when v_index = p_installment_count then p_total_cents - v_base_cents * (p_installment_count - 1) else v_base_cents end;
    v_occurrence_date := (p_occurred_on + make_interval(months => v_index - 1))::date;
    v_statement_id := private.statement_for_card_event(p_credit_card_id, v_user_id, v_occurrence_date);
    insert into public.card_events (user_id, credit_card_id, card_statement_id, card_category_id, event_type, description, amount_cents, occurred_on, points_per_usd_snapshot, brl_per_usd_snapshot)
    values (v_user_id, p_credit_card_id, v_statement_id, p_card_category_id, 'installment', trim(p_description) || ' (' || v_index || '/' || p_installment_count || ')', v_event_cents, v_occurrence_date, v_card.points_per_usd, v_card.brl_per_usd)
    returning id into v_event_id;
    v_event_ids := array_append(v_event_ids, v_event_id);
  end loop;
  return v_event_ids;
end;
$$;

create function public.create_chargeback(
  p_credit_card_id uuid,
  p_card_category_id uuid,
  p_description text,
  p_amount_cents integer,
  p_occurred_on date,
  p_parent_card_event_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_card public.credit_cards%rowtype;
  v_statement_id uuid;
  v_event_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;
  if p_amount_cents <= 0 then raise exception 'Amount must be positive.' using errcode = '22023'; end if;
  select * into v_card from public.credit_cards where id = p_credit_card_id and user_id = v_user_id and archived_at is null;
  if not found then raise exception 'Credit card not found.' using errcode = 'P0001'; end if;
  perform 1 from public.card_categories where id = p_card_category_id and user_id = v_user_id and archived_at is null;
  if not found then raise exception 'Card category not found.' using errcode = 'P0001'; end if;
  if p_parent_card_event_id is not null then
    perform 1 from public.card_events where id = p_parent_card_event_id and user_id = v_user_id and credit_card_id = p_credit_card_id;
    if not found then raise exception 'Original card event not found.' using errcode = 'P0001'; end if;
  end if;

  v_statement_id := private.statement_for_card_event(p_credit_card_id, v_user_id, p_occurred_on);
  insert into public.card_events (user_id, credit_card_id, card_statement_id, card_category_id, parent_card_event_id, event_type, description, amount_cents, occurred_on, points_per_usd_snapshot, brl_per_usd_snapshot)
  values (v_user_id, p_credit_card_id, v_statement_id, p_card_category_id, p_parent_card_event_id, 'chargeback', trim(p_description), p_amount_cents, p_occurred_on, v_card.points_per_usd, v_card.brl_per_usd)
  returning id into v_event_id;
  return v_event_id;
end;
$$;

create function public.ensure_recurring_bill_occurrences(p_through_month date)
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
  for v_bill in select * from public.recurring_bills where user_id = v_user_id and paused_at is null and archived_at is null loop
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

create function public.mark_recurring_bill_paid(p_occurrence_id uuid, p_paid_on date)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_occurrence public.recurring_bill_occurrences%rowtype;
  v_bill public.recurring_bills%rowtype;
  v_transaction_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;
  select * into v_occurrence from public.recurring_bill_occurrences where id = p_occurrence_id and user_id = v_user_id for update;
  if not found then raise exception 'Recurring bill occurrence not found.' using errcode = 'P0001'; end if;
  if v_occurrence.status <> 'pending' then raise exception 'Recurring bill occurrence is no longer pending.' using errcode = 'P0001'; end if;
  select * into v_bill from public.recurring_bills where id = v_occurrence.recurring_bill_id and user_id = v_user_id;

  insert into public.account_transactions (user_id, checking_account_id, account_category_id, transaction_type, description, amount_cents, occurred_on)
  values (v_user_id, v_bill.checking_account_id, v_bill.account_category_id, 'recurring_bill_payment', v_bill.description, v_bill.amount_cents, p_paid_on)
  returning id into v_transaction_id;
  update public.recurring_bill_occurrences set status = 'paid', account_transaction_id = v_transaction_id where id = v_occurrence.id;
  return v_transaction_id;
end;
$$;

create function public.skip_recurring_bill_occurrence(p_occurrence_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;
  update public.recurring_bill_occurrences set status = 'skipped'
  where id = p_occurrence_id and user_id = v_user_id and status = 'pending';
  if not found then raise exception 'Recurring bill occurrence is not pending.' using errcode = 'P0001'; end if;
end;
$$;

create function public.close_due_card_statements(p_as_of date default current_date)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_updated integer;
begin
  if v_user_id is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;
  update public.card_statements set status = 'closed'
  where user_id = v_user_id and status = 'open' and closing_date <= p_as_of;
  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

create function public.pay_card_statement(p_statement_id uuid, p_checking_account_id uuid, p_paid_on date)
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
  on conflict (user_id, name) do update set is_system = true
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

revoke all on function public.create_card_purchase(uuid, uuid, text, integer, date) from public;
revoke all on function public.create_installment_purchase(uuid, uuid, text, integer, smallint, date) from public;
revoke all on function public.create_chargeback(uuid, uuid, text, integer, date, uuid) from public;
revoke all on function public.ensure_recurring_bill_occurrences(date) from public;
revoke all on function public.mark_recurring_bill_paid(uuid, date) from public;
revoke all on function public.skip_recurring_bill_occurrence(uuid) from public;
revoke all on function public.close_due_card_statements(date) from public;
revoke all on function public.pay_card_statement(uuid, uuid, date) from public;
grant execute on function public.create_card_purchase(uuid, uuid, text, integer, date) to authenticated;
grant execute on function public.create_installment_purchase(uuid, uuid, text, integer, smallint, date) to authenticated;
grant execute on function public.create_chargeback(uuid, uuid, text, integer, date, uuid) to authenticated;
grant execute on function public.ensure_recurring_bill_occurrences(date) to authenticated;
grant execute on function public.mark_recurring_bill_paid(uuid, date) to authenticated;
grant execute on function public.skip_recurring_bill_occurrence(uuid) to authenticated;
grant execute on function public.close_due_card_statements(date) to authenticated;
grant execute on function public.pay_card_statement(uuid, uuid, date) to authenticated;
