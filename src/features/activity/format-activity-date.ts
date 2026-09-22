import { productLocale } from '@/shared/i18n/messages';

const dateFormatter = new Intl.DateTimeFormat(productLocale, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatActivityDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}
