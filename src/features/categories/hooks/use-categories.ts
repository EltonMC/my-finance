import { useQuery } from '@tanstack/react-query';
import { loadCategories } from '../api/category-repository';

export const categoriesKey = ['categories', 'list'] as const;

export function useCategories() {
  return useQuery({ queryKey: categoriesKey, queryFn: loadCategories, retry: false });
}
