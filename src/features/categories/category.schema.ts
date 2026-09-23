import { z } from 'zod';

const categoryFormSchema = z.object({ name: z.string().trim().min(1).max(80) });

export function parseCategoryForm(values: FormData): { success: true; name: string } | { success: false } {
  const parsed = categoryFormSchema.safeParse({ name: String(values.get('name') ?? '') });
  return parsed.success ? { success: true, name: parsed.data.name } : { success: false };
}
