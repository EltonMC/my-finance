import { useMutation } from '@tanstack/react-query';
import { signInAccount, signOutAccount, signUpAccount } from '../api/auth-commands';

type AuthInput = { name: string; email: string; password: string };

export function useAuthCommand() {
  return useMutation({
    mutationFn: async ({ mode, input }: { mode: 'sign-in' | 'sign-up'; input: AuthInput }) => {
      if (mode === 'sign-up') return signUpAccount(input.name, input.email, input.password);
      await signInAccount(input.email, input.password);
      return true;
    },
  });
}

export function useSignOut() {
  return useMutation({ mutationFn: signOutAccount });
}
