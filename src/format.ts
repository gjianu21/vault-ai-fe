import type { Money } from './types';

export function formatMoney(amount: Money, currency: string): string {
    const value = typeof amount === 'string' ? Number(amount) : amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}