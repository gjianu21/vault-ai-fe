export interface Me {
    id: string;
    email: string;
    roles: string[];
}

export type AccountType = 'CURRENT' | 'SAVINGS';
export type TransactionType = 'CREDIT' | 'DEBIT';

// GraphQL returns amounts as strings, REST as numbers
export type Money = string | number;

export interface Account {
    id: string;
    iban: string;
    name: string;
    type: AccountType;
    currency: string;
    balance: Money;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: Money;
    currency: string;
    description: string | null;
    counterpartyName?: string | null;
    bookedAt: string;
}

export type ActionType = 'GET_BALANCE' | 'GET_TRANSACTIONS' | 'TRANSFER';
export type ActionOutcome = 'COMPLETED' | 'PENDING_CONFIRMATION' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

export interface ActionResult {
    actionId: string | null;
    type: ActionType | null;
    outcome: ActionOutcome;
    message: string;
    data: unknown;
}

export interface TransferPreview {
    fromAccountId: string;
    fromAccountName: string;
    fromIban: string;
    toIban: string;
    amount: Money;
    currency: string;
    description: string;
    expiresAt: string;
}

export interface TransferResult {
    transactionId: string;
    toIban: string;
    amount: Money;
    currency: string;
    newBalance: Money;
}

export interface ChatResponse {
    conversationId: string;
    reply: string;
    action: ActionResult | null;
}

export interface ChatEntry {
    id: string;
    role: 'user' | 'assistant' | 'error';
    content: string;
    action?: ActionResult | null;
}