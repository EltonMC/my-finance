import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  archiveCheckingAccount,
  createCheckingAccount,
  type FinanceAccount,
  loadAccounts,
  updateCheckingAccount,
} from '@/features/accounts/api/account-repository';
import {
  archiveCategory,
  createCategory,
  type FinanceCategory,
  loadCategories,
  renameCategory,
} from '@/features/categories/api/category-repository';
import { renderApp as render } from '@/test/render-app';
import { DuplicateNameError } from '../shared/errors/duplicate-name';
import { App } from './App';

const getSupabaseClient = vi.hoisted(() => vi.fn());
vi.mock('../lib/supabase', () => ({ getSupabaseClient }));
vi.mock('@/features/accounts/api/account-repository', () => ({
  archiveCheckingAccount: vi.fn(),
  createCheckingAccount: vi.fn(),
  loadAccounts: vi.fn(),
  updateCheckingAccount: vi.fn(),
}));
vi.mock('@/features/categories/api/category-repository', () => ({
  archiveCategory: vi.fn(),
  createCategory: vi.fn(),
  loadCategories: vi.fn(),
  renameCategory: vi.fn(),
}));

type Overview = { accounts: FinanceAccount[]; accountCategories: FinanceCategory[]; cardCategories: FinanceCategory[] };
const emptyOverview: Overview = { accounts: [], accountCategories: [], cardCategories: [] };

function mockOverview(overview: Overview) {
  vi.mocked(loadAccounts).mockResolvedValue(overview.accounts);
  vi.mocked(loadCategories).mockResolvedValue({
    accountCategories: overview.accountCategories,
    cardCategories: overview.cardCategories,
  });
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.clearAllMocks();
  getSupabaseClient.mockReturnValue({ auth: { signOut: vi.fn() } } as never);
  mockOverview(emptyOverview);
  vi.mocked(createCheckingAccount).mockResolvedValue(undefined);
  vi.mocked(updateCheckingAccount).mockResolvedValue(undefined);
  vi.mocked(archiveCheckingAccount).mockResolvedValue(undefined);
  vi.mocked(createCategory).mockResolvedValue(undefined);
  vi.mocked(renameCategory).mockResolvedValue(undefined);
  vi.mocked(archiveCategory).mockResolvedValue(undefined);
});

describe('Finance home data', () => {
  it('loads active accounts and displays their derived Brazilian-real balance', async () => {
    mockOverview({
      accounts: [
        {
          id: 'account-1',
          name: 'Conta principal',
          institution: 'Banco local',
          openingBalanceCents: 100000,
          balanceCents: 135050,
        },
      ],
      accountCategories: [],
      cardCategories: [],
    });

    render(<App initialSession />);

    expect(await screen.findByText('Conta principal')).toBeVisible();
    expect(screen.getByText('R$ 1.350,50')).toBeVisible();
    expect(screen.getByText('Banco local')).toBeVisible();
  });

  it('creates the first checking account with an optional institution and opening balance', async () => {
    const user = userEvent.setup();
    render(<App initialSession />);

    await user.click(await screen.findByRole('button', { name: 'Adicionar primeira conta' }));
    await user.type(screen.getByLabelText('Nome da conta'), 'Conta principal');
    await user.type(screen.getByLabelText('Instituição (opcional)'), 'Banco local');
    await user.clear(screen.getByLabelText('Saldo inicial'));
    await user.type(screen.getByLabelText('Saldo inicial'), '1250,75');
    await user.click(screen.getByRole('button', { name: 'Salvar conta' }));

    expect(createCheckingAccount).toHaveBeenCalledWith({
      name: 'Conta principal',
      institution: 'Banco local',
      openingBalanceCents: 125075,
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Conta salva com sucesso.');
  });

  it.each([
    ['10.50', 1050],
    ['1.250,75', 125075],
    ['1.250', 125000],
    ['-35,5', -3550],
  ])('reads the opening balance %s as %i cents', async (typed, cents) => {
    const user = userEvent.setup();
    render(<App initialSession />);

    await user.click(await screen.findByRole('button', { name: 'Adicionar primeira conta' }));
    await user.type(screen.getByLabelText('Nome da conta'), 'Conta principal');
    await user.clear(screen.getByLabelText('Saldo inicial'));
    await user.type(screen.getByLabelText('Saldo inicial'), typed);
    await user.click(screen.getByRole('button', { name: 'Salvar conta' }));

    expect(createCheckingAccount).toHaveBeenCalledWith({
      name: 'Conta principal',
      institution: null,
      openingBalanceCents: cents,
    });
  });

  it('rejects an opening balance with ambiguous separators', async () => {
    const user = userEvent.setup();
    render(<App initialSession />);

    await user.click(await screen.findByRole('button', { name: 'Adicionar primeira conta' }));
    await user.type(screen.getByLabelText('Nome da conta'), 'Conta principal');
    await user.clear(screen.getByLabelText('Saldo inicial'));
    await user.type(screen.getByLabelText('Saldo inicial'), '10.5.0');
    await user.click(screen.getByRole('button', { name: 'Salvar conta' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Informe um saldo válido');
    expect(createCheckingAccount).not.toHaveBeenCalled();
  });

  it('shows a failed settings save once and clears it when the dialog is reopened', async () => {
    const user = userEvent.setup();
    vi.mocked(createCategory).mockRejectedValueOnce(new Error('duplicate'));
    render(<App initialSession />);

    await user.click(await screen.findByRole('button', { name: 'Ajustes' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar categoria de conta' }));
    await user.type(screen.getByLabelText('Nome da categoria'), 'Lazer');
    await user.click(screen.getByRole('button', { name: 'Salvar categoria' }));

    expect(await screen.findAllByRole('alert')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar categoria de conta' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explains that an active category already uses the chosen name', async () => {
    const user = userEvent.setup();
    vi.mocked(createCategory).mockRejectedValueOnce(new DuplicateNameError());
    render(<App initialSession />);

    await user.click(await screen.findByRole('button', { name: 'Ajustes' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar categoria de conta' }));
    await user.type(screen.getByLabelText('Nome da categoria'), 'Moradia');
    await user.click(screen.getByRole('button', { name: 'Salvar categoria' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe uma categoria ativa com esse nome.');
  });

  it('explains that an active account already uses the chosen name', async () => {
    const user = userEvent.setup();
    vi.mocked(createCheckingAccount).mockRejectedValueOnce(new DuplicateNameError());
    render(<App initialSession />);

    await user.click(await screen.findByRole('button', { name: 'Adicionar primeira conta' }));
    await user.type(screen.getByLabelText('Nome da conta'), 'Conta principal');
    await user.click(screen.getByRole('button', { name: 'Salvar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe uma conta ativa com esse nome.');
  });

  it('keeps a dialog open on Escape while its save is pending', async () => {
    const user = userEvent.setup();
    const pendingSave = createDeferred<undefined>();
    vi.mocked(createCheckingAccount).mockReturnValueOnce(pendingSave.promise);
    render(<App initialSession />);

    await user.click(await screen.findByRole('button', { name: 'Adicionar primeira conta' }));
    await user.type(screen.getByLabelText('Nome da conta'), 'Conta principal');
    await user.click(screen.getByRole('button', { name: 'Salvar conta' }));
    await user.keyboard('{Escape}');

    expect(screen.getByRole('dialog', { name: 'Adicionar conta' })).toBeVisible();
    pendingSave.resolve(undefined);
    expect(await screen.findByRole('status')).toHaveTextContent('Conta salva com sucesso.');
  });

  it('does not offer rename or archive for the system invoice-payment category', async () => {
    const user = userEvent.setup();
    mockOverview({
      accounts: [],
      accountCategories: [
        { id: 'category-1', name: 'Moradia', ledger: 'account', isSystem: false },
        { id: 'category-2', name: 'Pagamento de fatura', ledger: 'account', isSystem: true },
      ],
      cardCategories: [],
    });
    render(<App initialSession />);

    await user.click(await screen.findByRole('button', { name: 'Ajustes' }));

    expect(screen.getByText('Pagamento de fatura')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Renomear Pagamento de fatura' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Arquivar Pagamento de fatura' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Renomear Moradia' })).toBeVisible();
  });

  it('renames and archives a checking account through explicit actions', async () => {
    const user = userEvent.setup();
    mockOverview({
      accounts: [{ id: 'account-1', name: 'Conta antiga', institution: null, openingBalanceCents: 0, balanceCents: 0 }],
      accountCategories: [],
      cardCategories: [],
    });
    render(<App initialSession />);

    await user.click(await screen.findByRole('button', { name: 'Editar Conta antiga' }));
    const name = screen.getByLabelText('Nome da conta');
    await user.clear(name);
    await user.type(name, 'Conta nova');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(updateCheckingAccount).toHaveBeenCalledWith('account-1', {
      name: 'Conta nova',
      institution: null,
      openingBalanceCents: 0,
    });

    await user.click(await screen.findByRole('button', { name: 'Arquivar Conta antiga' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar arquivamento' }));
    expect(archiveCheckingAccount).toHaveBeenCalledWith('account-1');
  });

  it('creates, renames, and archives categories in the correct ledger', async () => {
    const user = userEvent.setup();
    mockOverview({
      accounts: [],
      accountCategories: [{ id: 'category-1', name: 'Moradia', ledger: 'account', isSystem: false }],
      cardCategories: [],
    });
    render(<App initialSession />);

    await user.click(await screen.findByRole('button', { name: 'Ajustes' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar categoria de conta' }));
    await user.type(screen.getByLabelText('Nome da categoria'), 'Educação');
    await user.click(screen.getByRole('button', { name: 'Salvar categoria' }));
    expect(createCategory).toHaveBeenCalledWith('account', 'Educação');

    await user.click(screen.getByRole('button', { name: 'Renomear Moradia' }));
    const categoryName = screen.getByLabelText('Nome da categoria');
    await user.clear(categoryName);
    await user.type(categoryName, 'Casa');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(renameCategory).toHaveBeenCalledWith('account', 'category-1', 'Casa');

    await user.click(screen.getByRole('button', { name: 'Arquivar Moradia' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar arquivamento' }));
    expect(archiveCategory).toHaveBeenCalledWith('account', 'category-1');
  });

  it('offers a retry when overview loading fails', async () => {
    const user = userEvent.setup();
    vi.mocked(loadAccounts).mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([]);
    render(<App initialSession />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar suas finanças.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(loadAccounts).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('Nenhuma conta cadastrada.')).toBeVisible();
  });

  it('shows field-specific validation for invalid account and category values', async () => {
    const user = userEvent.setup();
    render(<App initialSession />);

    await user.click(await screen.findByRole('button', { name: 'Adicionar primeira conta' }));
    await user.type(screen.getByLabelText('Nome da conta'), '   ');
    await user.click(screen.getByRole('button', { name: 'Salvar conta' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome da conta.');
    expect(screen.getByLabelText('Nome da conta')).toHaveAttribute('aria-invalid', 'true');

    await user.clear(screen.getByLabelText('Nome da conta'));
    await user.type(screen.getByLabelText('Nome da conta'), 'Conta');
    await user.clear(screen.getByLabelText('Saldo inicial'));
    await user.type(screen.getByLabelText('Saldo inicial'), '12,345');
    await user.click(screen.getByRole('button', { name: 'Salvar conta' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um saldo válido');
    expect(createCheckingAccount).not.toHaveBeenCalled();

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Ajustes' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar categoria de conta' }));
    await user.type(screen.getByLabelText('Nome da categoria'), '   ');
    await user.click(screen.getByRole('button', { name: 'Salvar categoria' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome da categoria.');
    expect(createCategory).not.toHaveBeenCalled();
  });

  it('moves, traps, and restores focus for a dialog and focuses view headings', async () => {
    const user = userEvent.setup();
    render(<App initialSession />);

    const addButton = await screen.findByRole('button', { name: 'Adicionar primeira conta' });
    await user.click(addButton);
    expect(screen.getByLabelText('Nome da conta')).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Salvar conta' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(addButton).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Ajustes' }));
    expect(screen.getByRole('heading', { name: 'Ajustes' })).toHaveFocus();
  });

  it('does not present empty categories while settings data is unavailable', async () => {
    const user = userEvent.setup();
    vi.mocked(loadAccounts).mockRejectedValue(new Error('network'));
    render(<App initialSession />);

    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: 'Ajustes' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar suas finanças.');
    expect(screen.queryByText('Nenhuma categoria ativa.')).not.toBeInTheDocument();
  });

  it('locks creation actions while the initial overview request is pending', async () => {
    const oldRequest = createDeferred<typeof emptyOverview>();
    vi.mocked(loadAccounts).mockReturnValueOnce(oldRequest.promise.then((overview) => overview.accounts));

    render(<App initialSession />);
    expect(screen.getAllByRole('button', { name: 'Adicionar conta' })).toHaveLength(2);
    expect(
      screen.getAllByRole('button', { name: 'Adicionar conta' }).every((button) => button.hasAttribute('disabled')),
    ).toBe(true);

    oldRequest.resolve(emptyOverview);
    expect(await screen.findByText('Nenhuma conta cadastrada.')).toBeVisible();
    expect(
      screen.getAllByRole('button', { name: 'Adicionar conta' }).every((button) => !button.hasAttribute('disabled')),
    ).toBe(true);
  });

  it('locks category creation until the settings data has loaded', async () => {
    const user = userEvent.setup();
    const request = createDeferred<typeof emptyOverview>();
    vi.mocked(loadCategories).mockReturnValueOnce(
      request.promise.then((overview) => ({
        accountCategories: overview.accountCategories,
        cardCategories: overview.cardCategories,
      })),
    );
    render(<App initialSession />);

    await user.click(screen.getByRole('button', { name: 'Ajustes' }));
    expect(screen.getByRole('button', { name: 'Adicionar categoria de conta' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Adicionar categoria de cartão' })).toBeDisabled();

    request.resolve(emptyOverview);
    expect((await screen.findAllByText('Nenhuma categoria ativa.'))[0]).toBeVisible();
    expect(screen.getByRole('button', { name: 'Adicionar categoria de conta' })).toBeEnabled();
  });
});
