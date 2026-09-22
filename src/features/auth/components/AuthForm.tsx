import type { FormEvent } from 'react';
import { translate } from '@/shared/i18n/translate';
import type { AuthField } from '../auth.schema';

type AuthFormProps = {
  isSignUp: boolean;
  submitting: boolean;
  errorField: AuthField | null;
  error: string | null;
  success: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function passwordDescription(isSignUp: boolean, invalid: boolean): string | undefined {
  if (isSignUp && invalid) return 'password-rules auth-field-error';
  if (isSignUp) return 'password-rules';
  return invalid ? 'auth-field-error' : undefined;
}

function submitLabel(isSignUp: boolean, submitting: boolean): string {
  if (isSignUp) return submitting ? translate('auth.signingUp') : translate('auth.signUpAction');
  return submitting ? translate('auth.signingIn') : translate('auth.signInAction');
}

export function AuthForm({ isSignUp, submitting, errorField, error, success, onSubmit }: AuthFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="form-stack"
      aria-label={isSignUp ? translate('auth.signUpForm') : translate('auth.signInForm')}
    >
      {isSignUp ? (
        <label>
          {translate('auth.name')}
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={errorField === 'name'}
            aria-describedby={errorField === 'name' ? 'auth-field-error' : undefined}
          />
        </label>
      ) : null}
      <label>
        {translate('auth.email')}
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={errorField === 'email'}
          aria-describedby={errorField === 'email' ? 'auth-field-error' : undefined}
        />
      </label>
      <label>
        {translate('auth.password')}
        <input
          name="password"
          type="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          minLength={isSignUp ? 10 : undefined}
          aria-describedby={passwordDescription(isSignUp, errorField === 'password')}
          aria-invalid={errorField === 'password'}
          required
        />
      </label>
      {isSignUp ? (
        <p id="password-rules" className="muted">
          {translate('auth.passwordRules')}
        </p>
      ) : null}
      {error ? (
        <p id={errorField ? 'auth-field-error' : undefined} className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="form-success" role="status">
          {success}
        </p>
      ) : null}
      <button type="submit" disabled={submitting}>
        {submitLabel(isSignUp, submitting)}
      </button>
    </form>
  );
}
