import type { ChatResponse } from '../types';
import { apiFetch } from './http';

export function sendMessage(message: string, conversationId: string | null): Promise<ChatResponse> {
    return apiFetch<ChatResponse>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message, conversationId }),
    });
}
