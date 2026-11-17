import type { ChatEntry } from './types';

/**
 * Temporary: remembers what the backend does not store yet (briefing cards, follow-ups, source)
 * for each conversation, so they come back when a chat is reopened.
 * Remove when GET /api/chat/conversations/{id}/messages returns this data itself.
 */
const STORAGE_KEY = 'vault-ai-chat-cache';

type Cache = Record<string, ChatEntry[]>;

function readAll(): Cache {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Cache) : {};
    } catch {
        return {};
    }
}

function writeAll(cache: Cache): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
        // storage full or not available: the app still works, the cards just won't come back
    }
}

export function saveConversation(conversationId: string, entries: ChatEntry[]): void {
    const cache = readAll();
    // never replay the typewriter for a reopened chat, and errors are not worth keeping
    cache[conversationId] = entries
        .filter((entry) => entry.role !== 'error')
        .map((entry) => ({ ...entry, animate: false }));
    writeAll(cache);
}

export function forgetConversation(conversationId: string): void {
    const cache = readAll();
    delete cache[conversationId];
    writeAll(cache);
}

/**
 * The backend's messages are the source of truth (order, ids, user text).
 * Each assistant message gets back what was shown for it: the same position among assistant messages.
 */
export function mergeWithCache(conversationId: string, fromServer: ChatEntry[]): ChatEntry[] {
    const cached = readAll()[conversationId];
    if (!cached) {
        return fromServer;
    }

    const cachedReplies = cached.filter((entry) => entry.role === 'assistant');
    let replyIndex = 0;

    return fromServer.map((entry) => {
        if (entry.role !== 'assistant') {
            return entry;
        }
        const remembered = cachedReplies[replyIndex++];
        if (!remembered) {
            return entry;
        }
        return {
            ...entry,
            content: remembered.content,
            source: remembered.source,
            citedSources: remembered.citedSources,
            briefing: remembered.briefing,
            followUps: remembered.followUps,
            animate: false,
        };
    });
}