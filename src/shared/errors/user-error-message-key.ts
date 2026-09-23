import type { MessageKey } from '@/shared/i18n/messages';
import { AuthConfigurationError, AuthNetworkError } from './auth-errors';
import { DuplicateNameError } from './duplicate-name';

export type ErrorOperation =
  | 'sign-in'
  | 'sign-up'
  | 'sign-out'
  | 'load-finance'
  | 'load-activity'
  | 'save-account'
  | 'save-category';

const fallback: Record<ErrorOperation, MessageKey> = {
  'sign-in': 'auth.signInFailure',
  'sign-up': 'auth.signUpFailure',
  'sign-out': 'home.signOutFailure',
  'load-finance': 'home.loadError',
  'load-activity': 'activity.loadError',
  'save-account': 'home.saveError',
  'save-category': 'home.saveError',
};

const configuration: Partial<Record<ErrorOperation, MessageKey>> = {
  'sign-in': 'auth.signInConfiguration',
  'sign-up': 'auth.signUpConfiguration',
  'sign-out': 'home.signOutConfiguration',
};

const network: Partial<Record<ErrorOperation, MessageKey>> = {
  'sign-in': 'auth.signInNetwork',
  'sign-up': 'auth.signUpNetwork',
  'sign-out': 'home.signOutNetwork',
};

const duplicate: Partial<Record<ErrorOperation, MessageKey>> = {
  'save-account': 'accounts.duplicateName',
  'save-category': 'home.duplicateCategory',
};

export function userErrorMessageKey(error: unknown, operation: ErrorOperation): MessageKey {
  if (error instanceof AuthConfigurationError) return configuration[operation] ?? fallback[operation];
  if (error instanceof AuthNetworkError) return network[operation] ?? fallback[operation];
  if (error instanceof DuplicateNameError) return duplicate[operation] ?? fallback[operation];
  return fallback[operation];
}
