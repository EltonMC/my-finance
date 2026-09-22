import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { userErrorMessageKey } from '@/shared/errors/user-error-message-key';
import { translate } from '@/shared/i18n/translate';
import { type AuthField, parseAuthInput } from './auth.schema';
import { AuthForm } from './components/AuthForm';
import { useAuthCommand } from './hooks/use-auth-command';

type AuthMode = 'sign-in' | 'sign-up';

export function AuthScreen({ onSignedIn }: { onSignedIn: () => Promise<void> }) {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { mutateAsync, isPending: submitting } = useAuthCommand();
  const [errorField, setErrorField] = useState<AuthField | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previousMode = useRef(mode);

  const isSignUp = mode === 'sign-up';

  useEffect(() => {
    if (previousMode.current !== mode) {
      titleRef.current?.focus();
      previousMode.current = mode;
    }
  }, [mode]);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorField(null);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseAuthInput(new FormData(event.currentTarget), isSignUp);
    setErrorField(parsed.success ? null : parsed.field);
    if (!parsed.success) {
      setError(
        parsed.field === 'name'
          ? translate('auth.nameRequired')
          : parsed.field === 'password'
            ? translate('auth.passwordWeak')
            : translate('auth.emailInvalid'),
      );
      return;
    }

    setError(null);
    setSuccess(null);
    setErrorField(null);

    try {
      const hasSession = await mutateAsync({ mode, input: parsed.input });
      if (hasSession) {
        await onSignedIn();
      } else {
        setSuccess(translate('auth.confirmEmail'));
        setMode('sign-in');
      }
    } catch (requestError) {
      setError(translate(userErrorMessageKey(requestError, mode)));
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">MyFinance</p>
        <h1 id="auth-title" ref={titleRef} tabIndex={-1}>
          {isSignUp ? translate('auth.signUpTitle') : translate('auth.signInTitle')}
        </h1>
        <p className="muted">{isSignUp ? translate('auth.signUpIntro') : translate('auth.signInIntro')}</p>
        <AuthForm
          key={mode}
          isSignUp={isSignUp}
          submitting={submitting}
          errorField={errorField}
          error={error}
          success={success}
          onSubmit={handleSubmit}
        />
        <p className="auth-alternate">
          {isSignUp ? translate('auth.alreadyHaveAccount') : translate('auth.noAccountYet')}
          <button
            type="button"
            className="auth-mode-button"
            disabled={submitting}
            onClick={() => changeMode(isSignUp ? 'sign-in' : 'sign-up')}
          >
            {isSignUp ? translate('auth.signInForm') : translate('auth.signUpForm')}
          </button>
        </p>
      </section>
    </main>
  );
}
