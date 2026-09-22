import type { FormEvent } from 'react';
import { useState } from 'react';
import { formatEditableBrl } from '@/shared/formatting/money';
import { translate } from '@/shared/i18n/translate';
import { useDialogFocus } from '@/shared/ui/use-dialog-focus';
import { parseAccountForm } from '../account.schema';
import type { CheckingAccountInput, FinanceAccount } from '../api/account-repository';

export function AccountDialog({
  account,
  saving,
  error,
  onClose,
  onSave,
}: {
  account: FinanceAccount | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: CheckingAccountInput) => Promise<void>;
}) {
  const [fieldError, setFieldError] = useState<{ field: 'name' | 'openingBalance'; message: string } | null>(null);
  const dialogRef = useDialogFocus(onClose, saving);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseAccountForm(new FormData(event.currentTarget));
    if (!parsed.success) {
      setFieldError({
        field: parsed.field,
        message: translate(
          parsed.reason === 'required'
            ? 'accounts.nameRequired'
            : parsed.reason === 'out-of-range'
              ? 'accounts.balanceOutOfRange'
              : 'accounts.balanceInvalid',
        ),
      });
      return;
    }
    setFieldError(null);
    void onSave(parsed.input);
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        ref={dialogRef}
        className="payment-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-dialog-title"
      >
        <p className="eyebrow">{translate('accounts.currentAccount')}</p>
        <h2 id="account-dialog-title">{account ? translate('accounts.editTitle') : translate('accounts.addTitle')}</h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            {translate('accounts.name')}
            <input
              name="name"
              required
              maxLength={80}
              defaultValue={account?.name ?? ''}
              aria-invalid={fieldError?.field === 'name'}
              aria-describedby={fieldError?.field === 'name' ? 'account-field-error' : undefined}
            />
          </label>
          <label>
            {translate('accounts.institution')}
            <input name="institution" maxLength={80} defaultValue={account?.institution ?? ''} />
          </label>
          <label>
            {translate('accounts.openingBalance')}
            <input
              name="openingBalance"
              inputMode="decimal"
              required
              defaultValue={formatEditableBrl(account?.openingBalanceCents ?? 0)}
              aria-invalid={fieldError?.field === 'openingBalance'}
              aria-describedby={fieldError?.field === 'openingBalance' ? 'account-field-error' : undefined}
            />
          </label>
          {fieldError ? (
            <p id="account-field-error" className="form-error" role="alert">
              {fieldError.message}
            </p>
          ) : null}
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="dialog-actions">
            <button type="button" className="secondary-button" disabled={saving} onClick={onClose}>
              {translate('actions.cancel')}
            </button>
            <button type="submit" disabled={saving}>
              {saving
                ? translate('actions.saving')
                : account
                  ? translate('actions.saveChanges')
                  : translate('accounts.save')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
