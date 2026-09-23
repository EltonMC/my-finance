import { z } from 'zod';
import type { CheckingAccountInput } from './api/account-repository';

function parseBrlCents(value: string): number | null {
  const trimmed = value.trim();
  let normalized: string;
  if (/^-?\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(trimmed)) {
    normalized = trimmed.replace(/\./g, '').replace(',', '.');
  } else if (/^-?\d+(,\d{1,2})?$/.test(trimmed)) {
    normalized = trimmed.replace(',', '.');
  } else if (/^-?\d+\.\d{1,2}$/.test(trimmed)) {
    normalized = trimmed;
  } else {
    return null;
  }
  return Math.round(Number(normalized) * 100);
}

const accountFormSchema = z.object({
  name: z.string().trim().min(1),
  institution: z.string().trim(),
  openingBalance: z.string().transform((value, context) => {
    const cents = parseBrlCents(value);
    if (cents === null) {
      context.addIssue({ code: 'custom', message: 'invalid' });
      return z.NEVER;
    }
    if (cents < -2147483648 || cents > 2147483647) {
      context.addIssue({ code: 'custom', message: 'out-of-range' });
      return z.NEVER;
    }
    return cents;
  }),
});

export function parseAccountForm(
  values: FormData,
):
  | { success: true; input: CheckingAccountInput }
  | { success: false; field: 'name' | 'openingBalance'; reason: 'required' | 'invalid' | 'out-of-range' } {
  const parsed = accountFormSchema.safeParse({
    name: String(values.get('name') ?? ''),
    institution: String(values.get('institution') ?? ''),
    openingBalance: String(values.get('openingBalance') ?? ''),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === 'name') return { success: false, field: 'name', reason: 'required' };
    return {
      success: false,
      field: 'openingBalance',
      reason: issue?.message === 'out-of-range' ? 'out-of-range' : 'invalid',
    };
  }
  return {
    success: true,
    input: {
      name: parsed.data.name,
      institution: parsed.data.institution || null,
      openingBalanceCents: parsed.data.openingBalance,
    },
  };
}
