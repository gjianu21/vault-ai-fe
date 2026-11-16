export interface Me {
    id: string;
    email: string;
    roles: string[];
}

// The dashboard, suggestions and agent mode are added in plan step FE-2.
export interface ChatResponse {
    conversationId: string;
    reply: string;
}

export interface ChatEntry {
    id: string;
    role: 'user' | 'assistant' | 'error';
    content: string;
}
