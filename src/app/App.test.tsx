import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('presents the email and password sign-in form before a session exists', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible()
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })

  it('lets an authenticated user inspect a card statement and its full payment impact', async () => {
    const user = userEvent.setup()
    render(<App initialSession />)

    await user.click(screen.getByRole('button', { name: 'Ver fatura' }))
    expect(screen.getByText('Fecha em 10 de setembro')).toBeVisible()
    expect(screen.getByText('Vence em 17 de setembro')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Pagar fatura' }))
    expect(screen.getByRole('heading', { name: 'Confirmar pagamento' })).toBeVisible()
    expect(screen.getByText('Criará uma despesa na conta selecionada.')).toBeVisible()
  })
})
