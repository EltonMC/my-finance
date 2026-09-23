import { formatBrl } from '@/shared/formatting/money';
import { translate } from '@/shared/i18n/translate';
import type { AccountActivity } from '../api/load-account-activity';
import { formatActivityDate } from '../format-activity-date';

type Transaction = AccountActivity['transactions'][number];

function directionLabel(type: Transaction['transactionType']) {
  if (type === 'income') return translate('activity.income');
  if (type === 'invoice_payment') return translate('activity.invoicePayment');
  if (type === 'recurring_bill_payment') return translate('activity.recurringBillPayment');
  return translate('activity.expense');
}

export function AccountActivityRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.transactionType === 'income';
  const isSystem =
    transaction.transactionType === 'invoice_payment' || transaction.transactionType === 'recurring_bill_payment';

  return (
    <li className="ledger-row">
      <div>
        <strong>{transaction.description}</strong>
        <span>{transaction.categoryName}</span>
        <time dateTime={transaction.occurredOn}>{formatActivityDate(transaction.occurredOn)}</time>
        {isSystem ? <span>{translate('activity.systemOrigin')}</span> : null}
      </div>
      <div className="activity-amount">
        <span>{directionLabel(transaction.transactionType)}</span>
        <strong>
          {isIncome ? '+ ' : '− '}
          {formatBrl(transaction.amountCents)}
        </strong>
      </div>
    </li>
  );
}
