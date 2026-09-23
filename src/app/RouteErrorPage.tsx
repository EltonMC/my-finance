import { Link } from 'react-router';
import { translate } from '@/shared/i18n/translate';

export function RouteErrorPage() {
  return (
    <main className="app-shell">
      <h1>{translate('errors.title')}</h1>
      <p>{translate('errors.unexpected')}</p>
      <Link to="/">{translate('navigation.home')}</Link>
    </main>
  );
}
