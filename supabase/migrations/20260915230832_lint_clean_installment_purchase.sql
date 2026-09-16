-- Recreate create_installment_purchase without the two plpgsql lint warnings it
-- was published with: an untyped '{}' array literal assigned to uuid[], and a
-- v_index declaration that shadows the FOR loop variable and is never read.
-- Behaviour, signature, privileges, and the security definer comment are
-- unchanged; create or replace preserves grants and comments.

create or replace function public.create_installment_purchase(
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
