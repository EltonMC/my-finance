# Data Dictionary

This is the semantic inventory of persistent business concepts. Add an entry before creating a durable table, view, or materialized projection. It helps the DBA reviewer detect duplicate concepts before data exists. The database guard fails when a migration creates a `public` table that is not named here.

| Entity | Purpose and source of truth | Owner / tenant boundary | Key relationships | Lifecycle and retention | Notes |
| --- | --- | --- | --- | --- | --- |
| `checking_account` | User-owned checking-account configuration and opening balance | `user_id` equals authenticated user | has account transactions, recurring bills, and invoice payments | Archive instead of deleting while records exist | Current balance derives from posted account transactions plus opening balance |
| `account_category` | User-owned category for checking-account activity | `user_id` equals authenticated user | labels account transactions and recurring bills | Archive preserves historical label | Separate namespace from card categories |
| `account_transaction` | Immutable posted income or expense in a checking account | inherited from account and stored `user_id` | may represent a recurring occurrence or invoice payment | Retained as financial history | Source of truth for current balance movement |
| `recurring_bill` | Monthly rule that creates one pending bill occurrence per month | `user_id` equals authenticated user | selects one account and account category | May be paused; history remains | Monthly only in MVP |
| `recurring_bill_occurrence` | One monthly pending, paid, or skipped result of a recurring bill | inherited from recurring bill and stored `user_id` | optionally links one account transaction | Retained as schedule history | Unique by recurring bill and occurrence month |
| `credit_card` | User-owned card configuration, limit, billing days, and reward settings | `user_id` equals authenticated user | has statements and card events | Archive instead of deleting while records exist | Stores current defaults only; events snapshot rewards |
| `card_category` | User-owned category for card activity | `user_id` equals authenticated user | labels card events | Archive preserves historical label | Separate namespace from account categories |
| `card_statement` | One billing-cycle statement for one card | inherited from card and stored `user_id` | groups card events and one payment | Open, closed, then paid lifecycle | Amount due and points derive from linked events |
| `card_event` | Immutable card debit or credit: purchase, installment, or chargeback | inherited from card and stored `user_id` | belongs to one statement and card category; optional parent event | Retained as financial history | Snapshots points-per-USD and BRL/USD rate |
| `invoice_payment` | One full settlement of an unpaid statement from a checking account | inherited from statement and stored `user_id` | one statement, one account, one account transaction | Retained as financial history | Unique by statement; no partial payments |

## Rules

- One entry describes one durable concept, not an implementation detail.
- A derived or cached representation names its authoritative source and refresh rule.
- A table with a similar name or overlapping attributes must either reuse the existing entity or document why the concepts differ.
- Personal data follows the column comments in the migration (`pii:none`, `pii:personal`, `pii:sensitive`). Sensitive data (health, religion, biometrics, racial origin, sex life, political opinion, children's data) needs an explicit purpose and the owner's approval.
- Retention says how long the data is kept and what happens when the person deletes the account.
- Do not include personal data values, credentials, or production records in this document.
