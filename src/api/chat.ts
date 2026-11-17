import type { ChatMessageDto, ChatResponse, Conversation } from '../types';
import { apiFetch } from './http';

export function sendMessage(message: string, conversationId: string | null): Promise<ChatResponse> {
    return apiFetch<ChatResponse>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message, conversationId }),
    });
}

export function fetchConversations(): Promise<Conversation[]> {
    return apiFetch<Conversation[]>('/api/chat/conversations');
}

export function fetchMessages(conversationId: string): Promise<ChatMessageDto[]> {
    return apiFetch<ChatMessageDto[]>(`/api/chat/conversations/${conversationId}/messages`);
}

export function closeConversation(conversationId: string): Promise<Conversation> {
    return apiFetch<Conversation>(`/api/chat/conversations/${conversationId}/close`, { method: 'POST' });
}

export function setConversationSaved(conversationId: string, saved: boolean): Promise<Conversation> {
    return apiFetch<Conversation>(`/api/chat/conversations/${conversationId}/saved`, {
        method: 'PUT',
        body: JSON.stringify({ saved }),
    });
}