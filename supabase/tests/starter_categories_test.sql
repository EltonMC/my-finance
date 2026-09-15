begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (id, email)
values ('00000000-0000-4000-8000-000000000099', 'new-user@example.test');

select is(
  (select count(*) from public.account_categories where user_id = '00000000-0000-4000-8000-000000000099'),
  8::bigint,
  'a new user receives eight account categories'
);
select is(
  (select count(*) from public.card_categories where user_id = '00000000-0000-4000-8000-000000000099'),
  7::bigint,
  'a new user receives seven card categories'
);
select results_eq(
  $$ select name from public.account_categories where user_id = '00000000-0000-4000-8000-000000000099' order by name $$,
  $$ values ('Alimentação'::text), ('Lazer'::text), ('Moradia'::text), ('Outros'::text), ('Pagamento de fatura'::text), ('Receitas'::text), ('Saúde'::text), ('Transporte'::text) $$,
  'account starter labels are complete and deterministic'
);
select results_eq(
  $$ select name from public.card_categories where user_id = '00000000-0000-4000-8000-000000000099' order by name $$,
  $$ values ('Alimentação'::text), ('Compras'::text), ('Lazer'::text), ('Moradia'::text), ('Outros'::text), ('Saúde'::text), ('Transporte'::text) $$,
  'card starter labels are complete and deterministic'
);
select is(
  (select count(*) from public.account_categories where user_id = '00000000-0000-4000-8000-000000000099' and archived_at is null),
  8::bigint,
  'account starter categories are active'
);
select is(
  (select count(*) from public.card_categories where user_id = '00000000-0000-4000-8000-000000000099' and archived_at is null),
  7::bigint,
  'card starter categories are active'
);

select * from finish();
rollback;
