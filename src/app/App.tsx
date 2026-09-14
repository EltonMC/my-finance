import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { getSupabaseClient } from '../shared/supabase'
import './app.css'

type AppProps = {
  initialSession?: boolean
}

export function App({ initialSession = false }: AppProps) {
  const [authenticated, setAuthenticated] = useState(initialSession)

  useEffect(() => {
    if (initialSession) {
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return
    }

    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) {
        setAuthenticated(true)
      }
    })

    return () => {
      active = false
    }
  }, [initialSession])

  if (!authenticated) {
    return <AuthScreen onSignedIn={() => setAuthenticated(true)} />
  }

  return <FinanceHome onSignedOut={() => setAuthenticated(false)} />
}

function AuthScreen({ onSignedIn }: { onSignedIn: () => void }) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const previousMode = useRef(mode)

  const isSignUp = mode === 'sign-up'

  useEffect(() => {
    if (previousMode.current !== mode) {
      titleRef.current?.focus()
      previousMode.current = mode
    }
  }, [mode])

  function changeMode(nextMode: 'sign-in' | 'sign-up') {
    setMode(nextMode)
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const name = String(values.get('name') ?? '').trim()
    const supabase = getSupabaseClient()

    if (isSignUp && !name) {
      setError('Informe seu nome.')
      return
    }

    if (!supabase) {
      setError(isSignUp ? 'Configure o Supabase para criar sua conta.' : 'Configure o Supabase para entrar.')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: String(values.get('email')),
          password: String(values.get('password')),
          options: { data: { name } },
        })

        if (signUpError) {
          setError('Não foi possível criar sua conta. Confira seus dados e tente novamente.')
          return
        }

        if (data.session) {
          onSignedIn()
          return
        }

        setSuccess('Conta criada. Confira seu e-mail para confirmar o cadastro e depois entre.')
        setMode('sign-in')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: String(values.get('email')),
        password: String(values.get('password')),
      })

      if (signInError) {
        setError('Não foi possível entrar. Confira seus dados e tente novamente.')
        return
      }

      onSignedIn()
    } catch {
      setError(isSignUp
        ? 'Não foi possível criar sua conta. Confira sua conexão e tente novamente.'
        : 'Não foi possível entrar. Confira sua conexão e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">MyFinance</p>
        <h1 id="auth-title" ref={titleRef} tabIndex={-1}>{isSignUp ? 'Crie sua conta' : 'Entre na sua conta'}</h1>
        <p className="muted">{isSignUp ? 'Comece com apenas seus dados essenciais.' : 'Organize suas contas e faturas em um só lugar.'}</p>
        <form key={mode} onSubmit={handleSubmit} className="form-stack" aria-label={isSignUp ? 'Criar conta' : 'Entrar'}>
          {isSignUp ? (
            <label>
              Nome
              <input name="name" type="text" autoComplete="name" required />
            </label>
          ) : null}
          <label>
            E-mail
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Senha
            <input name="password" type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} required />
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {success ? <p className="form-success" role="status">{success}</p> : null}
          <button type="submit" disabled={submitting}>
            {isSignUp ? (submitting ? 'Criando conta…' : 'Criar minha conta') : (submitting ? 'Entrando…' : 'Entrar')}
          </button>
        </form>
        <p className="auth-alternate">
          {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}
          <button type="button" className="auth-mode-button" disabled={submitting} onClick={() => changeMode(isSignUp ? 'sign-in' : 'sign-up')}>
            {isSignUp ? 'Entrar' : 'Criar conta'}
          </button>
        </p>
      </section>
    </main>
  )
}

function FinanceHome({ onSignedOut }: { onSignedOut: () => void }) {
  const [view, setView] = useState<'overview' | 'statement'>('overview')
  const [showPayment, setShowPayment] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)

  async function handleSignOut() {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setSignOutError('Configure o Supabase para sair com segurança.')
      return
    }

    setSigningOut(true)
    setSignOutError(null)
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) {
        setSignOutError('Não foi possível sair. Tente novamente.')
        return
      }
      onSignedOut()
    } catch {
      setSignOutError('Não foi possível sair. Confira sua conexão e tente novamente.')
    } finally {
      setSigningOut(false)
    }
  }

  if (view === 'statement') {
    return (
      <main className="app-shell">
        <header className="topbar">
          <button className="back-button" disabled={signingOut} onClick={() => setView('overview')}>Voltar</button>
          <p className="eyebrow">Cartão de crédito</p>
          <button className="secondary-button" disabled={signingOut} onClick={handleSignOut}>{signingOut ? 'Saindo…' : 'Sair'}</button>
        </header>
        {signOutError ? <p className="form-error" role="alert">{signOutError}</p> : null}
        <section className="statement-hero" aria-labelledby="statement-title">
          <p className="status">Fatura fechada</p>
          <h1 id="statement-title">R$ 1.248,50</h1>
          <p>Fecha em 10 de setembro</p>
          <p>Vence em 17 de setembro</p>
          <button onClick={() => setShowPayment(true)}>Pagar fatura</button>
        </section>
        <section className="summary-grid" aria-label="Resumo da fatura">
          <article><span>Pontos estimados</span><strong>549,34</strong></article>
          <article><span>Limite disponível</span><strong>R$ 3.751,50</strong></article>
        </section>
        <section className="ledger-section">
          <h2>Lançamentos</h2>
          <LedgerRow title="Compra parcelada 2/6" detail="Casa · 10 set" amount="- R$ 208,08" />
          <LedgerRow title="Chargeback" detail="Compras · 9 set" amount="+ R$ 52,00" credit />
        </section>
        {showPayment ? <PaymentDialog onClose={() => setShowPayment(false)} /> : null}
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">MyFinance</p><h1>Visão geral</h1></div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Adicionar lançamento" disabled={signingOut}>+</button>
          <button className="secondary-button" disabled={signingOut} onClick={handleSignOut}>{signingOut ? 'Saindo…' : 'Sair'}</button>
        </div>
      </header>
      {signOutError ? <p className="form-error" role="alert">{signOutError}</p> : null}
      <section className="attention-card" aria-labelledby="attention-title">
        <p className="eyebrow">Para hoje</p>
        <h2 id="attention-title">1 conta pendente</h2>
        <p>Internet vence amanhã · R$ 109,90</p>
        <button className="secondary-button">Marcar como paga</button>
      </section>
      <section className="ledger-section" aria-labelledby="accounts-title">
        <div className="section-heading"><h2 id="accounts-title">Contas</h2><button className="text-button">Ver todas</button></div>
        <article className="money-card"><span>Conta corrente</span><strong>R$ 2.840,10</strong><small>Saldo atual</small></article>
      </section>
      <section className="ledger-section" aria-labelledby="cards-title">
        <div className="section-heading"><h2 id="cards-title">Cartões</h2><button className="text-button">Ver todos</button></div>
        <article className="money-card card-summary">
          <div><span>Cartão principal</span><strong>R$ 1.248,50</strong><small>Fatura atual</small></div>
          <button className="secondary-button" onClick={() => setView('statement')}>Ver fatura</button>
        </article>
      </section>
      <nav className="bottom-navigation" aria-label="Navegação principal">
        <button aria-current="page">Início</button><button>Atividade</button><button>Cartões</button><button>Ajustes</button>
      </nav>
    </main>
  )
}

function PaymentDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="payment-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-title">
        <p className="eyebrow">Fatura fechada</p>
        <h2 id="payment-title">Confirmar pagamento</h2>
        <p>Você pagará R$ 1.248,50 integralmente usando a conta corrente.</p>
        <p className="muted">Criará uma despesa na conta selecionada.</p>
        <div className="dialog-actions"><button className="secondary-button" onClick={onClose}>Cancelar</button><button>Confirmar pagamento</button></div>
      </section>
    </div>
  )
}

function LedgerRow({ title, detail, amount, credit = false }: { title: string; detail: string; amount: string; credit?: boolean }) {
  return <article className="ledger-row"><div><strong>{title}</strong><span>{detail}</span></div><strong className={credit ? 'credit' : 'debit'}>{amount}</strong></article>
}
