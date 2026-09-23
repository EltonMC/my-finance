import { productLocale } from '@/shared/i18n/messages';

export function formatBrl(cents: number) {
  return new Intl.NumberFormat(productLocale, { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function formatEditableBrl(cents: number) {
  return new Intl.NumberFormat(productLocale, {
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
