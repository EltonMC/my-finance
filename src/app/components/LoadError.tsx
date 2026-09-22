import { translate } from '@/shared/i18n/translate';

export function LoadError({ onRetry }: { onRetry: () => Promise<void> }) {
  return (
    <div className="inline-error">
      <p className="form-error" role="alert">
        {translate('home.loadError')}
      </p>
      <button type="button" className="secondary-button" onClick={() => void onRetry()}>
        {translate('home.retry')}
      </button>
    </div>
  );
}
