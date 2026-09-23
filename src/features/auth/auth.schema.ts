import { z } from 'zod';

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const signUpSchema = signInSchema.extend({
  name: z.string().trim().min(1),
  password: z.string().min(10).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/),
});

type AuthInput = { email: string; password: string; name: string };
export type AuthField = 'name' | 'email' | 'password';

export function parseAuthInput(
  values: FormData,
  isSignUp: boolean,
): { success: true; input: AuthInput } | { success: false; field: AuthField } {
  const raw = {
    name: String(values.get('name') ?? ''),
    email: String(values.get('email') ?? ''),
    password: String(values.get('password') ?? ''),
  };
  const parsed = isSignUp ? signUpSchema.safeParse(raw) : signInSchema.safeParse(raw);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { success: false, field: field === 'name' || field === 'password' ? field : 'email' };
  }
  return { success: true, input: { ...parsed.data, name: isSignUp ? raw.name.trim() : '' } };
}
