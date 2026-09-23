import type { FormEvent } from 'react';
import { useState } from 'react';
import { translate } from '@/shared/i18n/translate';
import { useDialogFocus } from '@/shared/ui/use-dialog-focus';
import type { FinanceCategory, Ledger } from '../api/category-repository';
import { parseCategoryForm } from '../category.schema';

export function CategoryDialog({
  editor,
  saving,
  error,
  onClose,
  onSave,
}: {
  editor: { ledger: Ledger; category?: FinanceCategory };
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const dialogRef = useDialogFocus(onClose, saving);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseCategoryForm(new FormData(event.currentTarget));
    if (!parsed.success) {
      setValidationError(translate('categories.nameRequired'));
      return;
    }
    setValidationError(null);
    void onSave(parsed.name);
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        ref={dialogRef}
        className="payment-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
      >
        <p className="eyebrow">
          {editor.ledger === 'account' ? translate('categories.ledgerAccount') : translate('categories.ledgerCard')}
        </p>
        <h2 id="category-dialog-title">
          {editor.category ? translate('categories.renameTitle') : translate('categories.addTitle')}
        </h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            {translate('categories.name')}
            <input
              name="name"
              required
              maxLength={80}
              defaultValue={editor.category?.name ?? ''}
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? 'category-field-error' : undefined}
            />
          </label>
          {validationError ? (
            <p id="category-field-error" className="form-error" role="alert">
              {validationError}
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
                : editor.category
                  ? translate('actions.saveChanges')
                  : translate('categories.save')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
