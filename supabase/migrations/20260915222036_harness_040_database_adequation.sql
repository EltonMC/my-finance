-- Account deletion erases every owned financial record (owner decision 2026-09-15).
alter table public.checking_accounts drop constraint checking_accounts_user_id_fkey;
alter table public.checking_accounts add constraint checking_accounts_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.account_categories drop constraint account_categories_user_id_fkey;
alter table public.account_categories add constraint account_categories_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.credit_cards drop constraint credit_cards_user_id_fkey;
alter table public.credit_cards add constraint credit_cards_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.card_categories drop constraint card_categories_user_id_fkey;
alter table public.card_categories add constraint card_categories_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.recurring_bills drop constraint recurring_bills_user_id_fkey;
alter table public.recurring_bills add constraint recurring_bills_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.card_statements drop constraint card_statements_user_id_fkey;
alter table public.card_statements add constraint card_statements_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.card_events drop constraint card_events_user_id_fkey;
alter table public.card_events add constraint card_events_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.account_transactions drop constraint account_transactions_user_id_fkey;
alter table public.account_transactions add constraint account_transactions_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.recurring_bill_occurrences drop constraint recurring_bill_occurrences_user_id_fkey;
alter table public.recurring_bill_occurrences add constraint recurring_bill_occurrences_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.invoice_payments drop constraint invoice_payments_user_id_fkey;
alter table public.invoice_payments add constraint invoice_payments_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade;

comment on table public.checking_accounts is 'Checking accounts owned by one person, with opening balance; current balance derives from account transactions.';
comment on table public.account_categories is 'Categories that label one person''s checking-account transactions and recurring bills.';
comment on table public.credit_cards is 'Credit cards owned by one person, with limit, billing days, and reward settings.';
comment on table public.card_categories is 'Categories that label one person''s credit-card events.';
comment on table public.recurring_bills is 'Monthly bill rules that create one pending occurrence per month for one person.';
comment on table public.card_statements is 'Billing-cycle statements of one credit card.';
comment on table public.card_events is 'Immutable credit-card purchases, installments, and chargebacks.';
comment on table public.account_transactions is 'Immutable posted income and expenses of one checking account; source of balance movement.';
comment on table public.recurring_bill_occurrences is 'Monthly pending, paid, or skipped results of a recurring bill.';
comment on table public.invoice_payments is 'Full settlements of a card statement from a checking account.';

comment on column public.checking_accounts.id is 'pii:none identifier';
comment on column public.checking_accounts.user_id is 'pii:personal owner of the account';
comment on column public.checking_accounts.name is 'pii:personal account label chosen by the person';
comment on column public.checking_accounts.institution is 'pii:personal bank where the person holds the account';
comment on column public.checking_accounts.opening_balance_cents is 'pii:personal starting balance used to show the current balance';
comment on column public.checking_accounts.archived_at is 'pii:none lifecycle timestamp';
comment on column public.checking_accounts.created_at is 'pii:none audit timestamp';
comment on column public.checking_accounts.updated_at is 'pii:none audit timestamp';

comment on column public.account_categories.id is 'pii:none identifier';
comment on column public.account_categories.user_id is 'pii:personal owner of the category';
comment on column public.account_categories.name is 'pii:personal category label chosen by the person';
comment on column public.account_categories.is_system is 'pii:none marks the invoice-payment system category';
comment on column public.account_categories.archived_at is 'pii:none lifecycle timestamp';
comment on column public.account_categories.created_at is 'pii:none audit timestamp';
comment on column public.account_categories.updated_at is 'pii:none audit timestamp';

comment on column public.credit_cards.id is 'pii:none identifier';
comment on column public.credit_cards.user_id is 'pii:personal owner of the card';
comment on column public.credit_cards.name is 'pii:personal card label chosen by the person';
comment on column public.credit_cards.issuer is 'pii:personal card issuer used by the person';
comment on column public.credit_cards.credit_limit_cents is 'pii:personal credit limit used to show available credit';
comment on column public.credit_cards.closing_day is 'pii:personal billing closing day used to assign statements';
comment on column public.credit_cards.due_day is 'pii:personal billing due day used to show payment dates';
comment on column public.credit_cards.points_per_usd is 'pii:none reward rate configuration';
comment on column public.credit_cards.brl_per_usd is 'pii:none exchange rate configuration';
comment on column public.credit_cards.archived_at is 'pii:none lifecycle timestamp';
comment on column public.credit_cards.created_at is 'pii:none audit timestamp';
comment on column public.credit_cards.updated_at is 'pii:none audit timestamp';

comment on column public.card_categories.id is 'pii:none identifier';
comment on column public.card_categories.user_id is 'pii:personal owner of the category';
comment on column public.card_categories.name is 'pii:personal category label chosen by the person';
comment on column public.card_categories.archived_at is 'pii:none lifecycle timestamp';
comment on column public.card_categories.created_at is 'pii:none audit timestamp';
comment on column public.card_categories.updated_at is 'pii:none audit timestamp';

comment on column public.recurring_bills.id is 'pii:none identifier';
comment on column public.recurring_bills.user_id is 'pii:personal owner of the bill';
comment on column public.recurring_bills.checking_account_id is 'pii:none link to the paying account';
comment on column public.recurring_bills.account_category_id is 'pii:none link to the bill category';
comment on column public.recurring_bills.description is 'pii:personal bill description written by the person';
comment on column public.recurring_bills.amount_cents is 'pii:personal expected monthly amount';
comment on column public.recurring_bills.due_day is 'pii:personal monthly due day';
comment on column public.recurring_bills.start_date is 'pii:personal first month of the bill';
comment on column public.recurring_bills.paused_at is 'pii:none lifecycle timestamp';
comment on column public.recurring_bills.archived_at is 'pii:none lifecycle timestamp';
comment on column public.recurring_bills.created_at is 'pii:none audit timestamp';
comment on column public.recurring_bills.updated_at is 'pii:none audit timestamp';

comment on column public.card_statements.id is 'pii:none identifier';
comment on column public.card_statements.user_id is 'pii:personal owner of the statement';
comment on column public.card_statements.credit_card_id is 'pii:none link to the card';
comment on column public.card_statements.statement_month is 'pii:personal billing month of the person card';
comment on column public.card_statements.closing_date is 'pii:personal statement closing date';
comment on column public.card_statements.due_date is 'pii:personal statement due date';
comment on column public.card_statements.status is 'pii:none open, closed, or paid lifecycle state';
comment on column public.card_statements.paid_at is 'pii:none lifecycle timestamp';
comment on column public.card_statements.created_at is 'pii:none audit timestamp';
comment on column public.card_statements.updated_at is 'pii:none audit timestamp';

comment on column public.card_events.id is 'pii:none identifier';
comment on column public.card_events.user_id is 'pii:personal owner of the event';
comment on column public.card_events.credit_card_id is 'pii:none link to the card';
comment on column public.card_events.card_statement_id is 'pii:none link to the statement';
comment on column public.card_events.card_category_id is 'pii:none link to the category';
comment on column public.card_events.parent_card_event_id is 'pii:none link to the original purchase';
comment on column public.card_events.event_type is 'pii:none purchase, installment, or chargeback';
comment on column public.card_events.description is 'pii:personal purchase description written by the person';
comment on column public.card_events.amount_cents is 'pii:personal purchase amount';
comment on column public.card_events.occurred_on is 'pii:personal purchase date';
comment on column public.card_events.points_per_usd_snapshot is 'pii:none reward rate at purchase time';
comment on column public.card_events.brl_per_usd_snapshot is 'pii:none exchange rate at purchase time';
comment on column public.card_events.created_at is 'pii:none audit timestamp';

comment on column public.account_transactions.id is 'pii:none identifier';
comment on column public.account_transactions.user_id is 'pii:personal owner of the transaction';
comment on column public.account_transactions.checking_account_id is 'pii:none link to the account';
comment on column public.account_transactions.account_category_id is 'pii:none link to the category';
comment on column public.account_transactions.transaction_type is 'pii:none income, expense, or invoice payment';
comment on column public.account_transactions.description is 'pii:personal transaction description written by the person';
comment on column public.account_transactions.amount_cents is 'pii:personal transaction amount';
comment on column public.account_transactions.occurred_on is 'pii:personal transaction date';
comment on column public.account_transactions.created_at is 'pii:none audit timestamp';

comment on column public.recurring_bill_occurrences.id is 'pii:none identifier';
comment on column public.recurring_bill_occurrences.user_id is 'pii:personal owner of the occurrence';
comment on column public.recurring_bill_occurrences.recurring_bill_id is 'pii:none link to the bill rule';
comment on column public.recurring_bill_occurrences.occurrence_month is 'pii:personal month of the bill occurrence';
comment on column public.recurring_bill_occurrences.due_date is 'pii:personal due date of the occurrence';
comment on column public.recurring_bill_occurrences.status is 'pii:none pending, paid, or skipped state';
comment on column public.recurring_bill_occurrences.account_transaction_id is 'pii:none link to the payment transaction';
comment on column public.recurring_bill_occurrences.created_at is 'pii:none audit timestamp';
comment on column public.recurring_bill_occurrences.updated_at is 'pii:none audit timestamp';

comment on column public.invoice_payments.id is 'pii:none identifier';
comment on column public.invoice_payments.user_id is 'pii:personal owner of the payment';
comment on column public.invoice_payments.card_statement_id is 'pii:none link to the paid statement';
comment on column public.invoice_payments.checking_account_id is 'pii:none link to the paying account';
comment on column public.invoice_payments.account_transaction_id is 'pii:none link to the payment transaction';
comment on column public.invoice_payments.amount_cents is 'pii:personal amount paid';
comment on column public.invoice_payments.paid_on is 'pii:personal payment date';
comment on column public.invoice_payments.created_at is 'pii:none audit timestamp';

-- Atomic multi-table commands: authenticated-only RPC, owner from auth.uid(), every referenced row ownership-checked, empty search_path.
comment on function public.create_card_purchase(uuid, uuid, text, integer, date) is 'harness:allow-security-definer atomic card purchase; owner from auth.uid() and ownership checked for every referenced row';
comment on function public.create_installment_purchase(uuid, uuid, text, integer, smallint, date) is 'harness:allow-security-definer atomic installment plan across statements; owner from auth.uid() and ownership checked';
comment on function public.create_chargeback(uuid, uuid, text, integer, date, uuid) is 'harness:allow-security-definer atomic chargeback linked to an owned purchase; owner from auth.uid() and ownership checked';
comment on function public.ensure_recurring_bill_occurrences(date) is 'harness:allow-security-definer generates only the caller''s missing monthly occurrences; owner from auth.uid()';
comment on function public.mark_recurring_bill_paid(uuid, date) is 'harness:allow-security-definer atomic payment transaction plus occurrence update; owner from auth.uid() and ownership checked';
comment on function public.skip_recurring_bill_occurrence(uuid) is 'harness:allow-security-definer skips an owned pending occurrence; owner from auth.uid()';
comment on function public.close_due_card_statements(date) is 'harness:allow-security-definer closes only the caller''s due statements; owner from auth.uid()';
comment on function public.pay_card_statement(uuid, uuid, date) is 'harness:allow-security-definer atomic full statement settlement; owner from auth.uid() and ownership checked for statement and account';
