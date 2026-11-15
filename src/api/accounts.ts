import type { Account, Transaction } from '../types';
import { apiFetch } from './http';

export interface AccountWithTransactions extends Account {
    transactions: Transaction[];
}

const ACCOUNTS_QUERY = `
  query Accounts {
    accounts {
      id
      iban
      name
      type
      currency
      balance
      transactions(limit: 5) {
        id
        type
        amount
        currency
        description
        counterpartyName
        bookedAt
      }
    }
  }
`;

interface GraphQlResponse<T> {
    data?: T;
    errors?: { message: string }[];
}

export async function fetchAccounts(): Promise<AccountWithTransactions[]> {
    const result = await apiFetch<GraphQlResponse<{ accounts: AccountWithTransactions[] }>>('/graphql', {
        method: 'POST',
        body: JSON.stringify({ query: ACCOUNTS_QUERY }),
    });
    if (result.errors?.length) {
        throw new Error(result.errors[0].message);
    }
    return result.data?.accounts ?? [];
}