import { useEffect, useState } from 'react';
import { fetchAccounts, type AccountWithTransactions } from '../api/accounts';
import { formatDate, formatMoney } from '../format';

interface Props {
    refreshKey: number;
}

export function AccountsPanel({ refreshKey }: Props) {
    const [accounts, setAccounts] = useState<AccountWithTransactions[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        fetchAccounts()
            .then((data) => {
                if (!cancelled) {
                    setAccounts(data);
                    setError(null);
                }
            })
            .catch((e: unknown) => {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : 'Could not load your accounts');
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    return (
        <section className="panel accounts-panel">
            <h2>Your accounts</h2>
            {loading && accounts.length === 0 && <p className="muted">Loading...</p>}
            {error && <div className="alert error">{error}</div>}

            {accounts.map((account) => (
                <article key={account.id} className="account-card">
                    <div className="account-header">
                        <div>
                            <div className="account-name">{account.name}</div>
                            <div className="account-iban">{account.iban}</div>
                        </div>
                        <div className="account-balance">{formatMoney(account.balance, account.currency)}</div>
                    </div>

                    <ul className="transactions">
                        {account.transactions.map((transaction) => (
                            <li key={transaction.id}>
                                <div>
                                    <div>{transaction.description ?? transaction.counterpartyName ?? 'Transaction'}</div>
                                    <div className="muted small">{formatDate(transaction.bookedAt)}</div>
                                </div>
                                <span className={transaction.type === 'CREDIT' ? 'amount credit' : 'amount debit'}>
                                    {transaction.type === 'CREDIT' ? '+' : '-'}
                                    {formatMoney(transaction.amount, transaction.currency)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </article>
            ))}
        </section>
    );
}