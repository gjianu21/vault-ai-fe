import { useEffect, useRef, useState, type FormEvent } from 'react';
import { login } from '../api/auth';
import { sendMessage } from '../api/chat';
import { ApiError } from '../api/http';
import type { ChatEntry } from '../types';
import { ActionCard } from './ActionCard';

const SUGGESTIONS = [
    'What is my balance?',
    'Show my last transactions',
    'Transfer 150 to RO49AAAA1B31007593840000',
];

interface Props {
    onBalanceChanged: () => void;
}

export function ChatPanel({ onBalanceChanged }: Props) {
    const [entries, setEntries] = useState<ChatEntry[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries, sending]);

    async function submit(text: string) {
        const message = text.trim();
        if (!message || sending) {
            return;
        }

        setInput('');
        setEntries((previous) => [...previous, { id: crypto.randomUUID(), role: 'user', content: message }]);
        setSending(true);

        try {
            const response = await sendMessage(message, conversationId);
            setConversationId(response.conversationId);
            setEntries((previous) => [
                ...previous,
                { id: crypto.randomUUID(), role: 'assistant', content: response.reply, action: response.action },
            ]);
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                login();
                return;
            }
            const errorText = error instanceof Error ? error.message : 'Something went wrong';
            setEntries((previous) => [...previous, { id: crypto.randomUUID(), role: 'error', content: errorText }]);
        } finally {
            setSending(false);
        }
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        void submit(input);
    }

    return (
        <section className="panel chat-panel">
            <h2>Assistant</h2>

            <div className="messages">
                {entries.length === 0 && (
                    <div className="empty-chat">
                        <p className="muted">Ask me about your accounts. For example:</p>
                        <div className="suggestions">
                            {SUGGESTIONS.map((suggestion) => (
                                <button key={suggestion} className="chip" onClick={() => void submit(suggestion)}>
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {entries.map((entry) => (
                    <div key={entry.id} className={`message ${entry.role}`}>
                        <div className="bubble">{entry.content}</div>
                        {entry.action && <ActionCard action={entry.action} onBalanceChanged={onBalanceChanged} />}
                    </div>
                ))}

                {sending && (
                    <div className="message assistant">
                        <div className="bubble typing">Thinking...</div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <form className="composer" onSubmit={handleSubmit}>
                <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type a message..."
                    maxLength={2000}
                    disabled={sending}
                />
                <button className="btn primary" type="submit" disabled={sending || !input.trim()}>
                    Send
                </button>
            </form>
        </section>
    );
}