import { Link } from 'react-router';
import { translate } from '@/shared/i18n/translate';

export function NotFoundPage() {
  return (
    <main className="app-shell">
      <h1>{translate('navigation.notFoundTitle')}</h1>
      <Link to="/">{translate('navigation.home')}</Link>
    </main>
  );
}
