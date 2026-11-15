import { useRef, useState } from 'react';
import { confirmAction, rejectAction } from '../api/chat';
import { formatDate, formatMoney } from '../format';
import type { Account, ActionResult, Transaction, TransferPreview, TransferResult } from '../types';

interface Props {
    action: ActionResult;
    onBalanceChanged: () => void;
}

/** Shows the result of an action, or the confirmation card for a pending transfer. */
export function ActionCard({ action, onBalanceChanged }: Props) {
    const [result, setResult] = useState<ActionResult>(action);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // one key per confirmation: a retry or a double click cannot execute the transfer twice
    const idempotencyKey = useRef(crypto.randomUUID());

    async function decide(confirm: boolean) {
        if (!result.actionId) {
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const next = confirm
                ? await confirmAction(result.actionId, idempotencyKey.current)
                : await rejectAction(result.actionId);
            setResult(next);
            if (confirm && next.outcome === 'COMPLETED') {
                onBalanceChanged();
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not complete the action');
        } finally {
            setBusy(false);
        }
    }

    if (result.outcome === 'PENDING_CONFIRMATION') {
        const preview = action.data as TransferPreview;
        return (
            <div className="action-card pending">
                <div className="action-title">Confirm transfer</div>
                <dl className="details">
                    <dt>From</dt>
                    <dd>
                        {preview.fromAccountName} <span className="muted small">{preview.fromIban}</span>
                    </dd>
                    <dt>To</dt>
                    <dd>{preview.toIban}</dd>
                    <dt>Amount</dt>
                    <dd className="strong">{formatMoney(preview.amount, preview.currency)}</dd>
                    <dt>Description</dt>
                    <dd>{preview.description}</dd>
                </dl>
                {error && <div className="alert error">{error}</div>}
                <div className="actions">
                    <button className="btn secondary" disabled={busy} onClick={() => void decide(false)}>
                        Cancel
                    </button>
                    <button className="btn primary" disabled={busy} onClick={() => void decide(true)}>
                        {busy ? 'Processing...' : 'Confirm transfer'}
                    </button>
                </div>
            </div>
        );
    }

    if (result.outcome === 'COMPLETED' && result.type === 'GET_BALANCE') {
        const account = result.data as Account;
        return (
            <div className="action-card completed">
                <div className="muted small">{account.name}</div>
                <div className="big-amount">{formatMoney(account.balance, account.currency)}</div>
            </div>
        );
    }

    if (result.outcome === 'COMPLETED' && result.type === 'GET_TRANSACTIONS') {
        const transactions = result.data as Transaction[];
        return (
            <div className="action-card completed">
                <ul className="transactions">
                    {transactions.map((transaction) => (
                        <li key={transaction.id}>
                            <div>
                                <div>{transaction.description ?? 'Transaction'}</div>
                                <div className="muted small">{formatDate(transaction.bookedAt)}</div>
                            </div>
                            <span className={transaction.type === 'CREDIT' ? 'amount credit' : 'amount debit'}>
                                {transaction.type === 'CREDIT' ? '+' : '-'}
                                {formatMoney(transaction.amount, transaction.currency)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    if (result.outcome === 'COMPLETED' && result.type === 'TRANSFER') {
        const transfer = result.data as TransferResult | null;
        return (
            <div className="action-card completed">
                <div className="action-title">Transfer completed</div>
                {transfer && (
                    <p className="small">
                        {formatMoney(transfer.amount, transfer.currency)} sent to {transfer.toIban}. New balance:{' '}
                        <strong>{formatMoney(transfer.newBalance, transfer.currency)}</strong>
                    </p>
                )}
            </div>
        );
    }

    // REJECTED, CANCELLED, EXPIRED
    return <div className={`action-card ${result.outcome.toLowerCase()}`}>{result.message}</div>;
}