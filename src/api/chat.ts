import type { ActionResult, ChatResponse } from '../types';
import { apiFetch } from './http';

export function sendMessage(message: string, conversationId: string | null): Promise<ChatResponse> {
    return apiFetch<ChatResponse>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message, conversationId }),
    });
}

/** The same idempotency key for retries of the same confirmation: the transfer is executed only once. */
export function confirmAction(actionId: string, idempotencyKey: string): Promise<ActionResult> {
    return apiFetch<ActionResult>(`/api/actions/${actionId}/confirm`, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
    });
}

export function rejectAction(actionId: string): Promise<ActionResult> {
    return apiFetch<ActionResult>(`/api/actions/${actionId}/reject`, { method: 'POST' });
}