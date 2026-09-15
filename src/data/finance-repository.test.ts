import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSupabaseClient } from '../shared/supabase'
import { DuplicateNameError } from './errors'
import { createCategory, renameCategory } from './finance-repository'

vi.mock('../shared/supabase', () => ({ getSupabaseClient: vi.fn() }))

const duplicate = { code: '23505', message: 'duplicate key value violates unique constraint "account_categories_active_name_key"' }

function mockClient(result: { error: unknown }) {
  const single = vi.fn().mockResolvedValue(result)
  const chain = { eq: vi.fn(), is: vi.fn(), select: vi.fn(), single }
  chain.eq.mockReturnValue(chain)
  chain.is.mockReturnValue(chain)
  chain.select.mockReturnValue(chain)
  const client = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue(result),
      update: vi.fn().mockReturnValue(chain),
    }),
  }
  vi.mocked(getSupabaseClient).mockReturnValue(client as never)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('finance repository errors', () => {
  it('reports a duplicate active category name when creating a category', async () => {
    mockClient({ error: duplicate })
    await expect(createCategory('account', 'Lazer')).rejects.toBeInstanceOf(DuplicateNameError)
  })

  it('reports a duplicate active category name when renaming a category', async () => {
    mockClient({ error: duplicate })
    await expect(renameCategory('card', 'category-1', 'Lazer')).rejects.toBeInstanceOf(DuplicateNameError)
  })

  it('keeps other database failures generic', async () => {
    mockClient({ error: { code: '42501', message: 'permission denied' } })
    const failure = createCategory('account', 'Lazer')
    await expect(failure).rejects.toThrow('permission denied')
    await expect(failure).rejects.not.toBeInstanceOf(DuplicateNameError)
  })
})
