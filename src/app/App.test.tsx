import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSupabaseClient } from '../shared/supabase'
import { App } from './App'

vi.mock('../shared/supabase', () => ({ getSupabaseClient: vi.fn() }))
vi.mock('../data/finance-repository', () => ({
  archiveCategory: vi.fn(),
  archiveCheckingAccount: vi.fn(),
  createCategory: vi.fn(),
  createCheckingAccount: vi.fn(),
  loadFinanceOverview: vi.fn().mockResolvedValue({ accounts: [], accountCategories: [], cardCategories: [] }),
  renameCategory: vi.fn(),
  updateCheckingAccount: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(getSupabaseClient).mockReturnValue(null)
})

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve
  })
  return { promise, resolve }
}

describe('App', () => {
  it('presents the email and password sign-in form before a session exists', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible()
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })

  it('creates a user account with only name, email, and password', async () => {
    const user = userEvent.setup()
    const signUp = vi.fn().mockResolvedValue({ data: { session: {} }, error: null })
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        signUp,
      },
    } as never)

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    const form = screen.getByRole('form', { name: 'Criar conta' })
    expect(form.querySelectorAll('input')).toHaveLength(3)
    await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Safe-password1')
    await user.click(screen.getByRole('button', { name: 'Criar minha conta' }))

    expect(signUp).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'Safe-password1',
      options: { data: { name: 'Ana Souza' } },
    })
    expect(screen.getByRole('heading', { name: 'Visão geral' })).toBeVisible()
  })

  it('explains the password rules before a user account is created', async () => {
    const user = userEvent.setup()
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    } as never)

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    const password = screen.getByLabelText('Senha')
    expect(password).toHaveAccessibleDescription('Use pelo menos 10 caracteres, com letras maiúsculas, minúsculas e números.')
    expect(password).toHaveAttribute('minLength', '10')
  })

  it.each(['Short1a', 'lowercase-only1', 'UPPERCASE-ONLY1', 'No-digits-here'])('rejects the weak password %s before calling Supabase', async (weakPassword) => {
    const user = userEvent.setup()
    const signUp = vi.fn()
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }), signUp },
    } as never)

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), weakPassword)
    await user.click(screen.getByRole('button', { name: 'Criar minha conta' }))

    expect(screen.getByRole('alert')).toHaveTextContent('A senha precisa ter pelo menos 10 caracteres, com letras maiúsculas, minúsculas e números.')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('aria-invalid', 'true')
    expect(signUp).not.toHaveBeenCalled()
  })

  it('shows a registration error and keeps retry available', async () => {
    const user = userEvent.setup()
    const signUp = vi.fn()
      .mockResolvedValueOnce({ data: { session: null }, error: new Error('duplicate') })
      .mockResolvedValueOnce({ data: { session: {} }, error: null })
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        signUp,
      },
    } as never)

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Safe-password1')
    await user.click(screen.getByRole('button', { name: 'Criar minha conta' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível criar sua conta.')
    expect(screen.getByRole('button', { name: 'Criar minha conta' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Criar minha conta' }))
    expect(signUp).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('heading', { name: 'Visão geral' })).toBeVisible()
  })

  it('recovers when the registration request is rejected', async () => {
    const user = userEvent.setup()
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        signUp: vi.fn().mockRejectedValue(new Error('network')),
      },
    } as never)

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Safe-password1')
    await user.click(screen.getByRole('button', { name: 'Criar minha conta' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Confira sua conexão')
    expect(screen.getByRole('button', { name: 'Criar minha conta' })).toBeEnabled()
  })

  it('keeps registration controls locked while the request is pending', async () => {
    const user = userEvent.setup()
    const request = createDeferred<{ data: { session: object }, error: null }>()
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        signUp: vi.fn().mockReturnValue(request.promise),
      },
    } as never)

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Safe-password1')
    await user.click(screen.getByRole('button', { name: 'Criar minha conta' }))

    expect(screen.getByRole('button', { name: 'Criando conta…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()

    await act(async () => request.resolve({ data: { session: {} }, error: null }))
    expect(screen.getByRole('heading', { name: 'Visão geral' })).toBeVisible()
  })

  it('rejects a name that is empty after trimming', async () => {
    const user = userEvent.setup()
    const signUp = vi.fn()
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        signUp,
      },
    } as never)

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    await user.type(screen.getByLabelText('Nome'), '   ')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Safe-password1')
    await user.click(screen.getByRole('button', { name: 'Criar minha conta' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Informe seu nome.')
    expect(signUp).not.toHaveBeenCalled()
  })

  it('returns to sign-in with a confirmation message when email confirmation is required', async () => {
    const user = userEvent.setup()
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        signUp: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
    } as never)

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Safe-password1')
    await user.click(screen.getByRole('button', { name: 'Criar minha conta' }))

    expect(screen.getByRole('heading', { name: 'Entre na sua conta' })).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Confira seu e-mail para confirmar o cadastro')
    expect(screen.getByLabelText('Senha')).toHaveValue('')
  })

  it('returns from registration and still signs in', async () => {
    const user = userEvent.setup()
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        signInWithPassword,
      },
    } as never)

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(screen.getByRole('heading', { name: 'Crie sua conta' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByRole('heading', { name: 'Entre na sua conta' })).toHaveFocus()
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Safe-password1')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'Safe-password1' })
    expect(screen.getByRole('heading', { name: 'Visão geral' })).toBeVisible()
  })

  it('shows the registration-specific setup error when Supabase is unavailable', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Safe-password1')
    await user.click(screen.getByRole('button', { name: 'Criar minha conta' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Configure o Supabase para criar sua conta.')
  })

  it('ignores a stale empty session lookup after successful registration', async () => {
    const user = userEvent.setup()
    const sessionLookup = createDeferred<{ data: { session: null } }>()
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockReturnValue(sessionLookup.promise),
        signUp: vi.fn().mockResolvedValue({ data: { session: {} }, error: null }),
      },
    } as never)

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Safe-password1')
    await user.click(screen.getByRole('button', { name: 'Criar minha conta' }))
    expect(screen.getByRole('heading', { name: 'Visão geral' })).toBeVisible()

    await act(async () => sessionLookup.resolve({ data: { session: null } }))
    expect(screen.getByRole('heading', { name: 'Visão geral' })).toBeVisible()
  })

  it('does not present simulated debts or card balances as user data', async () => {
    render(<App initialSession />)

    expect(await screen.findByText('Nenhum cartão cadastrado.')).toBeVisible()
    expect(screen.queryByText('R$ 1.248,50')).not.toBeInTheDocument()
    expect(screen.queryByText('Internet vence amanhã · R$ 109,90')).not.toBeInTheDocument()
  })

  it('ends the authenticated session and returns to sign-in', async () => {
    const user = userEvent.setup()
    const signOut = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(getSupabaseClient).mockReturnValue({ auth: { signOut } } as never)

    render(<App initialSession />)
    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(signOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(screen.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible()
  })

  it('keeps sign-out disabled while pending', async () => {
    const user = userEvent.setup()
    const request = createDeferred<{ error: null }>()
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: { signOut: vi.fn().mockReturnValue(request.promise) },
    } as never)

    render(<App initialSession />)
    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(screen.getByRole('button', { name: 'Saindo…' })).toBeDisabled()

    await act(async () => request.resolve({ error: null }))
    expect(screen.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible()
  })

  it('shows a sign-out error and allows a retry', async () => {
    const user = userEvent.setup()
    const signOut = vi.fn()
      .mockResolvedValueOnce({ error: new Error('temporary') })
      .mockResolvedValueOnce({ error: null })
    vi.mocked(getSupabaseClient).mockReturnValue({ auth: { signOut } } as never)

    render(<App initialSession />)
    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível sair.')
    expect(screen.getByRole('button', { name: 'Sair' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(signOut).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible()
  })

  it('keeps sign-out visible and retryable from settings', async () => {
    const user = userEvent.setup()
    const signOut = vi.fn().mockResolvedValue({ error: new Error('temporary') })
    vi.mocked(getSupabaseClient).mockReturnValue({ auth: { signOut } } as never)

    render(<App initialSession />)
    await user.click(await screen.findByRole('button', { name: 'Ajustes' }))
    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(signOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível sair.')
    expect(screen.getByRole('button', { name: 'Sair' })).toBeEnabled()
    expect(screen.getByRole('heading', { name: 'Ajustes' })).toBeVisible()
  })
})
