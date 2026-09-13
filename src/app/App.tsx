import { useEffect, useState } from 'react'
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

    void supabase.auth.getSession().then(({ data }) => setAuthenticated(Boolean(data.session)))
  }, [initialSession])

  if (!authenticated) {
    return <SignIn onSignedIn={() => setAuthenticated(true)} />
  }

  return <FinanceHome />
}

function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const supabase = getSupabaseClient()

    if (!supabase) {
      setError('Configure o Supabase para entrar.')
      return
    }

    setSubmitting(true)
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(values.get('email')),
      password: String(values.get('password')),
    })
    setSubmitting(false)

    if (signInError) {
      setError('Não foi possível entrar. Confira seus dados e tente novamente.')
      return
    }

    onSignedIn()
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="sign-in-title">
        <p className="eyebrow">MyFinance</p>
        <h1 id="sign-in-title">Entre na sua conta</h1>
        <p className="muted">Organize suas contas e faturas em um só lugar.</p>
        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            E-mail
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Senha
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button type="submit" disabled={submitting}>{submitting ? 'Entrando…' : 'Entrar'}</button>
        </form>
      </section>
    </main>
  )
}

function FinanceHome() {
  const [view, setView] = useState<'overview' | 'statement'>('overview')
  const [showPayment, setShowPayment] = useState(false)

  if (view === 'statement') {
    return (
      <main className="app-shell">
        <header className="topbar">
          <button className="back-button" onClick={() => setView('overview')}>Voltar</button>
          <p className="eyebrow">Cartão de crédito</p>
        </header>
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
        <button className="icon-button" aria-label="Adicionar lançamento">+</button>
      </header>
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
