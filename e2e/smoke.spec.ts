import { expect, test } from '@playwright/test'

// Smoke coverage only: the production bundle boots, renders the sign-in screen,
// and switches to sign-up. It deliberately avoids Supabase so the Quality gate
// does not need a database.
test.describe('application smoke', () => {
  test('boots and renders the sign-in screen', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('pageerror', (error) => consoleErrors.push(error.message))

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible()
    await expect(page.getByRole('form', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByLabel('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible()

    expect(consoleErrors).toEqual([])
  })

  test('switches to the sign-up screen', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page.getByRole('heading', { name: 'Crie sua conta' })).toBeVisible()
    await expect(page.getByLabel('Nome')).toBeVisible()
    await expect(page.getByText('Use pelo menos 10 caracteres')).toBeVisible()
  })
})
