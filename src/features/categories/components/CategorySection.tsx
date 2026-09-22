import { translate } from '@/shared/i18n/translate';
import type { FinanceCategory } from '../api/category-repository';

export function CategorySection({
  title,
  addLabel,
  categories,
  loading,
  onAdd,
  onRename,
  onArchive,
}: {
  title: string;
  addLabel: string;
  categories: FinanceCategory[];
  loading: boolean;
  onAdd: () => void;
  onRename: (category: FinanceCategory) => void;
  onArchive: (category: FinanceCategory) => void;
}) {
  return (
    <section className="ledger-section" aria-label={title}>
      <div className="section-heading">
        <h2>{title}</h2>
        <button type="button" className="text-button" disabled={loading} onClick={onAdd}>
          {addLabel}
        </button>
      </div>
      {loading ? <p className="muted">{translate('categories.loading')}</p> : null}
      {!loading && categories.length === 0 ? <p className="muted">{translate('categories.empty')}</p> : null}
      <div className="settings-list">
        {categories.map((category) => (
          <article className="settings-row" key={category.id}>
            <strong>{category.name}</strong>
            {category.isSystem ? (
              <small className="muted">{translate('categories.system')}</small>
            ) : (
              <div className="card-actions">
                <button
                  type="button"
                  className="text-button"
                  aria-label={translate('categories.rename', { name: category.name })}
                  onClick={() => onRename(category)}
                >
                  {translate('actions.rename')}
                </button>
                <button
                  type="button"
                  className="text-button danger-button"
                  aria-label={translate('categories.archive', { name: category.name })}
                  onClick={() => onArchive(category)}
                >
                  {translate('actions.archive')}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
