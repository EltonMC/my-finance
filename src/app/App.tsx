import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  archiveCategory,
  archiveCheckingAccount,
  createCategory,
  createCheckingAccount,
  loadFinanceOverview,
  renameCategory,
  updateCheckingAccount,
} from '../data/finance-repository'
import type { CheckingAccountInput, FinanceAccount, FinanceCategory, FinanceOverview, Ledger } from '../data/finance-repository'
import { DuplicateNameError } from '../data/errors'
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
  const [passwordInvalid, setPasswordInvalid] = useState(false)
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
    setPasswordInvalid(false)
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

    const weakPassword = isSignUp && !isStrongPassword(String(values.get('password') ?? ''))
    setPasswordInvalid(weakPassword)
    if (weakPassword) {
      setError('A senha precisa ter pelo menos 10 caracteres, com letras maiúsculas, minúsculas e números.')
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
            <input
              name="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={isSignUp ? 10 : undefined}
              aria-describedby={isSignUp ? 'password-rules' : undefined}
              aria-invalid={passwordInvalid || undefined}
              required
            />
          </label>
          {isSignUp ? (
            <p id="password-rules" className="muted">Use pelo menos 10 caracteres, com letras maiúsculas, minúsculas e números.</p>
          ) : null}
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
  const [view, setView] = useState<'overview' | 'settings'>('overview')
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [overview, setOverview] = useState<FinanceOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [savedStatus, setSavedStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [accountEditor, setAccountEditor] = useState<FinanceAccount | 'new' | null>(null)
  const [categoryEditor, setCategoryEditor] = useState<{ ledger: Ledger; category?: FinanceCategory } | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<
    | { kind: 'account'; id: string; label: string }
    | { kind: 'category'; id: string; label: string; ledger: Ledger }
    | null
  >(null)
  const latestLoad = useRef(0)
  const viewTitleRef = useRef<HTMLHeadingElement>(null)

  const refreshOverview = useCallback(async () => {
    const loadId = ++latestLoad.current
    setLoading(true)
    setLoadError(null)
    try {
      const nextOverview = await loadFinanceOverview()
      if (latestLoad.current === loadId) {
        setOverview(nextOverview)
      }
    } catch {
      if (latestLoad.current === loadId) {
        setLoadError('Não foi possível carregar suas finanças.')
      }
    } finally {
      if (latestLoad.current === loadId) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void refreshOverview()
    return () => {
      latestLoad.current += 1
    }
  }, [refreshOverview])

  useEffect(() => {
    viewTitleRef.current?.focus()
  }, [view])

  async function runMutation(action: () => Promise<void>, successMessage: string) {
    setSaving(true)
    setMutationError(null)
    setSavedStatus(null)
    try {
      await action()
      setAccountEditor(null)
      setCategoryEditor(null)
      setArchiveTarget(null)
      setSavedStatus(successMessage)
      await refreshOverview()
    } catch (error) {
      setMutationError(error instanceof DuplicateNameError
        ? 'Já existe uma categoria ativa com esse nome.'
        : 'Não foi possível salvar. Confira os dados e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  function closeDialogs() {
    setAccountEditor(null)
    setCategoryEditor(null)
    setArchiveTarget(null)
    setMutationError(null)
  }

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

  if (view === 'settings') {
    return (
      <main className="app-shell">
        <header className="topbar">
          <button className="back-button" disabled={saving || signingOut} onClick={() => setView('overview')}>Voltar</button>
          <div><p className="eyebrow">Organização</p><h1 ref={viewTitleRef} tabIndex={-1}>Ajustes</h1></div>
          <button className="secondary-button" disabled={signingOut || saving} onClick={handleSignOut}>{signingOut ? 'Saindo…' : 'Sair'}</button>
        </header>
        {signOutError ? <p className="form-error" role="alert">{signOutError}</p> : null}
        {loadError ? <LoadError onRetry={refreshOverview} /> : null}
        {savedStatus ? <p className="form-success app-status" role="status">{savedStatus}</p> : null}
        {mutationError && !categoryEditor && !archiveTarget ? <p className="form-error app-status" role="alert">{mutationError}</p> : null}
        {!loadError ? (
          <>
            <CategorySection
              title="Categorias da conta"
              addLabel="Adicionar categoria de conta"
              categories={overview?.accountCategories ?? []}
              loading={loading}
              onAdd={() => setCategoryEditor({ ledger: 'account' })}
              onRename={(category) => setCategoryEditor({ ledger: 'account', category })}
              onArchive={(category) => setArchiveTarget({ kind: 'category', id: category.id, label: category.name, ledger: 'account' })}
            />
            <CategorySection
              title="Categorias do cartão"
              addLabel="Adicionar categoria de cartão"
              categories={overview?.cardCategories ?? []}
              loading={loading}
              onAdd={() => setCategoryEditor({ ledger: 'card' })}
              onRename={(category) => setCategoryEditor({ ledger: 'card', category })}
              onArchive={(category) => setArchiveTarget({ kind: 'category', id: category.id, label: category.name, ledger: 'card' })}
            />
          </>
        ) : null}
        <nav className="bottom-navigation" aria-label="Navegação principal">
          <button onClick={() => setView('overview')}>Início</button><button>Atividade</button><button>Cartões</button><button aria-current="page">Ajustes</button>
        </nav>
        {categoryEditor ? (
          <CategoryDialog
            editor={categoryEditor}
            saving={saving}
            error={mutationError}
            onClose={closeDialogs}
            onSave={(name) => runMutation(
              () => categoryEditor.category
                ? renameCategory(categoryEditor.ledger, categoryEditor.category.id, name)
                : createCategory(categoryEditor.ledger, name),
              categoryEditor.category ? 'Categoria atualizada com sucesso.' : 'Categoria salva com sucesso.',
            )}
          />
        ) : null}
        {archiveTarget?.kind === 'category' ? (
          <ArchiveDialog
            label={archiveTarget.label}
            saving={saving}
            error={mutationError}
            onClose={closeDialogs}
            onConfirm={() => runMutation(() => archiveCategory(archiveTarget.ledger, archiveTarget.id), 'Categoria arquivada com sucesso.')}
          />
        ) : null}
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">MyFinance</p><h1 ref={viewTitleRef} tabIndex={-1}>Visão geral</h1></div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Adicionar conta" disabled={signingOut || loading} onClick={() => setAccountEditor('new')}>+</button>
          <button className="secondary-button" disabled={signingOut} onClick={handleSignOut}>{signingOut ? 'Saindo…' : 'Sair'}</button>
        </div>
      </header>
      {signOutError ? <p className="form-error" role="alert">{signOutError}</p> : null}
      {savedStatus ? <p className="form-success app-status" role="status">{savedStatus}</p> : null}
      {mutationError && !accountEditor && !archiveTarget ? <p className="form-error app-status" role="alert">{mutationError}</p> : null}
      <section className="attention-card" aria-labelledby="attention-title">
        <p className="eyebrow">Para hoje</p>
        <h2 id="attention-title">Tudo organizado em um só lugar</h2>
        <p>Suas cobranças recorrentes aparecerão aqui quando forem cadastradas.</p>
      </section>
      <section className="ledger-section" aria-labelledby="accounts-title">
        <div className="section-heading"><h2 id="accounts-title">Contas</h2><button className="text-button" disabled={loading} onClick={() => setAccountEditor('new')}>Adicionar conta</button></div>
        {loading ? <p className="muted" role="status">Carregando suas finanças…</p> : null}
        {loadError ? <LoadError onRetry={refreshOverview} /> : null}
        {!loading && !loadError && overview?.accounts.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma conta cadastrada.</p>
            <button className="secondary-button" onClick={() => setAccountEditor('new')}>Adicionar primeira conta</button>
          </div>
        ) : null}
        <div className="account-list">
          {overview?.accounts.map((account) => (
            <article className="money-card" key={account.id}>
              <span>{account.name}</span>
              <strong>{formatBrl(account.balanceCents)}</strong>
              <small>{account.institution ?? 'Saldo atual'}</small>
              <div className="card-actions">
                <button className="text-button" aria-label={`Editar ${account.name}`} onClick={() => setAccountEditor(account)}>Editar</button>
                <button className="text-button danger-button" aria-label={`Arquivar ${account.name}`} onClick={() => setArchiveTarget({ kind: 'account', id: account.id, label: account.name })}>Arquivar</button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="ledger-section" aria-labelledby="cards-title">
        <div className="section-heading"><h2 id="cards-title">Cartões</h2></div>
        <div className="empty-state"><p>Nenhum cartão cadastrado.</p><small>O cadastro de cartões será disponibilizado na próxima etapa.</small></div>
      </section>
      <nav className="bottom-navigation" aria-label="Navegação principal">
        <button aria-current="page">Início</button><button>Atividade</button><button>Cartões</button><button onClick={() => setView('settings')}>Ajustes</button>
      </nav>
      {accountEditor ? (
        <AccountDialog
          account={accountEditor === 'new' ? null : accountEditor}
          saving={saving}
          error={mutationError}
          onClose={closeDialogs}
          onSave={(input) => runMutation(
            () => accountEditor === 'new' ? createCheckingAccount(input) : updateCheckingAccount(accountEditor.id, input),
            accountEditor === 'new' ? 'Conta salva com sucesso.' : 'Conta atualizada com sucesso.',
          )}
        />
      ) : null}
      {archiveTarget?.kind === 'account' ? (
        <ArchiveDialog
          label={archiveTarget.label}
          saving={saving}
          error={mutationError}
          onClose={closeDialogs}
          onConfirm={() => runMutation(() => archiveCheckingAccount(archiveTarget.id), 'Conta arquivada com sucesso.')}
        />
      ) : null}
    </main>
  )
}

function LoadError({ onRetry }: { onRetry: () => Promise<void> }) {
  return (
    <div className="inline-error">
      <p className="form-error" role="alert">Não foi possível carregar suas finanças.</p>
      <button className="secondary-button" onClick={() => void onRetry()}>Tentar novamente</button>
    </div>
  )
}

function CategorySection({ title, addLabel, categories, loading, onAdd, onRename, onArchive }: {
  title: string
  addLabel: string
  categories: FinanceCategory[]
  loading: boolean
  onAdd: () => void
  onRename: (category: FinanceCategory) => void
  onArchive: (category: FinanceCategory) => void
}) {
  return (
    <section className="ledger-section" aria-label={title}>
      <div className="section-heading"><h2>{title}</h2><button className="text-button" onClick={onAdd}>{addLabel}</button></div>
      {loading ? <p className="muted">Carregando…</p> : null}
      {!loading && categories.length === 0 ? <p className="muted">Nenhuma categoria ativa.</p> : null}
      <div className="settings-list">
        {categories.map((category) => (
          <article className="settings-row" key={category.id}>
            <strong>{category.name}</strong>
            {category.isSystem ? (
              <small className="muted">Categoria do sistema</small>
            ) : (
              <div className="card-actions">
                <button className="text-button" aria-label={`Renomear ${category.name}`} onClick={() => onRename(category)}>Renomear</button>
                <button className="text-button danger-button" aria-label={`Arquivar ${category.name}`} onClick={() => onArchive(category)}>Arquivar</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function AccountDialog({ account, saving, error, onClose, onSave }: {
  account: FinanceAccount | null
  saving: boolean
  error: string | null
  onClose: () => void
  onSave: (input: CheckingAccountInput) => Promise<void>
}) {
  const [fieldError, setFieldError] = useState<{ field: 'name' | 'openingBalance'; message: string } | null>(null)
  const dialogRef = useDialogFocus(onClose, saving)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const name = String(values.get('name') ?? '').trim()
    const openingBalanceCents = parseBrlCents(String(values.get('openingBalance') ?? ''))
    if (!name) {
      setFieldError({ field: 'name', message: 'Informe o nome da conta.' })
      return
    }
    if (openingBalanceCents === null) {
      setFieldError({ field: 'openingBalance', message: 'Informe um saldo válido, com no máximo duas casas decimais.' })
      return
    }
    if (openingBalanceCents < -2147483648 || openingBalanceCents > 2147483647) {
      setFieldError({ field: 'openingBalance', message: 'O saldo informado está fora do limite permitido.' })
      return
    }
    setFieldError(null)
    const institution = String(values.get('institution') ?? '').trim()
    void onSave({
      name,
      institution: institution || null,
      openingBalanceCents,
    })
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section ref={dialogRef} className="payment-dialog" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
        <p className="eyebrow">Conta corrente</p>
        <h2 id="account-dialog-title">{account ? 'Editar conta' : 'Adicionar conta'}</h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>Nome da conta<input name="name" required maxLength={80} defaultValue={account?.name ?? ''} aria-invalid={fieldError?.field === 'name'} aria-describedby={fieldError?.field === 'name' ? 'account-field-error' : undefined} /></label>
          <label>Instituição (opcional)<input name="institution" maxLength={80} defaultValue={account?.institution ?? ''} /></label>
          <label>Saldo inicial<input name="openingBalance" inputMode="decimal" required defaultValue={formatEditableBrl(account?.openingBalanceCents ?? 0)} aria-invalid={fieldError?.field === 'openingBalance'} aria-describedby={fieldError?.field === 'openingBalance' ? 'account-field-error' : undefined} /></label>
          {fieldError ? <p id="account-field-error" className="form-error" role="alert">{fieldError.message}</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <div className="dialog-actions">
            <button type="button" className="secondary-button" disabled={saving} onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={saving}>{saving ? 'Salvando…' : account ? 'Salvar alterações' : 'Salvar conta'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function CategoryDialog({ editor, saving, error, onClose, onSave }: {
  editor: { ledger: Ledger; category?: FinanceCategory }
  saving: boolean
  error: string | null
  onClose: () => void
  onSave: (name: string) => Promise<void>
}) {
  const [validationError, setValidationError] = useState<string | null>(null)
  const dialogRef = useDialogFocus(onClose, saving)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = String(new FormData(event.currentTarget).get('name') ?? '').trim()
    if (!name) {
      setValidationError('Informe o nome da categoria.')
      return
    }
    setValidationError(null)
    void onSave(name)
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section ref={dialogRef} className="payment-dialog" role="dialog" aria-modal="true" aria-labelledby="category-dialog-title">
        <p className="eyebrow">{editor.ledger === 'account' ? 'Conta' : 'Cartão'}</p>
        <h2 id="category-dialog-title">{editor.category ? 'Renomear categoria' : 'Adicionar categoria'}</h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>Nome da categoria<input name="name" required maxLength={80} defaultValue={editor.category?.name ?? ''} aria-invalid={Boolean(validationError)} aria-describedby={validationError ? 'category-field-error' : undefined} /></label>
          {validationError ? <p id="category-field-error" className="form-error" role="alert">{validationError}</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <div className="dialog-actions">
            <button type="button" className="secondary-button" disabled={saving} onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={saving}>{saving ? 'Salvando…' : editor.category ? 'Salvar alterações' : 'Salvar categoria'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function ArchiveDialog({ label, saving, error, onClose, onConfirm }: {
  label: string
  saving: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const dialogRef = useDialogFocus(onClose, saving)
  return (
    <div className="dialog-backdrop" role="presentation">
      <section ref={dialogRef} className="payment-dialog" role="dialog" aria-modal="true" aria-labelledby="archive-dialog-title">
        <p className="eyebrow">Arquivar</p>
        <h2 id="archive-dialog-title">Arquivar {label}?</h2>
        <p>O item sairá das listas ativas, mas o histórico financeiro será preservado.</p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="dialog-actions">
          <button className="secondary-button" disabled={saving} onClick={onClose}>Cancelar</button>
          <button className="danger-action" disabled={saving} onClick={() => void onConfirm()}>{saving ? 'Arquivando…' : 'Confirmar arquivamento'}</button>
        </div>
      </section>
    </div>
  )
}

function isStrongPassword(password: string) {
  return password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)
}

function formatBrl(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function formatEditableBrl(cents: number) {
  return (cents / 100).toFixed(2).replace('.', ',')
}

function parseBrlCents(value: string) {
  const trimmed = value.trim()
  let normalized: string
  if (/^-?\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(trimmed)) {
    normalized = trimmed.replace(/\./g, '').replace(',', '.')
  } else if (/^-?\d+(,\d{1,2})?$/.test(trimmed)) {
    normalized = trimmed.replace(',', '.')
  } else if (/^-?\d+\.\d{1,2}$/.test(trimmed)) {
    normalized = trimmed
  } else {
    return null
  }
  return Math.round(Number(normalized) * 100)
}

function useDialogFocus(onClose: () => void, saving: boolean) {
  const dialogRef = useRef<HTMLElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const savingRef = useRef(saving)
  savingRef.current = saving

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = dialogRef.current
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    dialog?.querySelector<HTMLElement>(focusableSelector)?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (!savingRef.current) {
          onCloseRef.current()
        }
        return
      }
      if (event.key !== 'Tab' || !dialog) {
        return
      }
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [])

  return dialogRef
}
