import { translate } from '@/shared/i18n/translate';
import { useDialogFocus } from './use-dialog-focus';

export function ArchiveDialog({
  label,
  saving,
  error,
  onClose,
  onConfirm,
}: {
  label: string;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const dialogRef = useDialogFocus(onClose, saving);
  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        ref={dialogRef}
        className="payment-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-dialog-title"
      >
        <p className="eyebrow">{translate('archive.eyebrow')}</p>
        <h2 id="archive-dialog-title">{translate('archive.title', { name: label })}</h2>
        <p>{translate('archive.description')}</p>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="dialog-actions">
          <button type="button" className="secondary-button" disabled={saving} onClick={onClose}>
            {translate('actions.cancel')}
          </button>
          <button type="button" className="danger-action" disabled={saving} onClick={() => void onConfirm()}>
            {saving ? translate('archive.saving') : translate('archive.confirm')}
          </button>
        </div>
      </section>
    </div>
  );
}
