import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import { useSpeechInput } from '../hooks/useSpeechInput';
import type { ChatEntry, Conversation, Me } from '../types';
import { Icon } from './Icon';
import { MessageItem } from './MessageItem';

const SUGGESTIONS = [
    'Prepare me for my next customer meeting',
    'Which customers need attention this week?',
    'Introduce yourself in two sentences',
];

interface Props {
    me: Me;
    conversation: Conversation | null;
    contextName: string | null;
    entries: ChatEntry[];
    sending: boolean;
    loading: boolean;
    onSend: (text: string) => void;
    onToggleSaved: (conversation: Conversation) => void;
    onClose: (conversation: Conversation) => void;
}

export function ChatPanel({
    me,
    conversation,
    contextName,
    entries,
    sending,
    loading,
    onSend,
    onToggleSaved,
    onClose,
}: Props) {
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const speech = useSpeechInput((text) => setInput((previous) => (previous ? `${previous} ${text}` : text)));

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries, sending]);

    // instant scroll (not smooth) while the text is being typed, otherwise it lags behind
    function scrollToBottom() {
        bottomRef.current?.scrollIntoView({ block: 'end' });
    }

    function submit(text: string) {
        if (!text.trim() || sending) {
            return;
        }
        onSend(text);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        submit(input);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        // Enter sends, Shift+Enter adds a new line
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit(input);
        }
    }

    function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setInput(event.target.value);
        event.target.style.height = 'auto';
        event.target.style.height = `${event.target.scrollHeight}px`;
    }

    return (
        <section className="chat">
            <header className="chat-header">
                <div className="chat-title">
                    <h2>{conversation?.title ?? 'New chat'}</h2>
                    {contextName && (
                        <span className="context-pill">
                            <span className="context-dot" />
                            Context: {contextName}
                        </span>
                    )}
                </div>

                {conversation && (
                    <div className="chat-header-actions">
                        <button
                            className={conversation.saved ? 'icon-btn saved' : 'icon-btn'}
                            onClick={() => onToggleSaved(conversation)}
                            title={conversation.saved ? 'Remove from saved' : 'Save chat'}
                            aria-label={conversation.saved ? 'Remove from saved' : 'Save chat'}
                            aria-pressed={conversation.saved}
                        >
                            <Icon name="bookmark" filled={conversation.saved} />
                        </button>
                        <button
                            className="icon-btn"
                            onClick={() => onClose(conversation)}
                            title="Close chat"
                            aria-label="Close chat"
                        >
                            <Icon name="close" />
                        </button>
                    </div>
                )}
            </header>

            <div className="chat-body">
                <div className="messages">
                    {loading && <p className="muted loading-text">Loading messages...</p>}

                    {!loading && entries.length === 0 && (
                        <div className="welcome">
                            <img className="welcome-logo" src="/db-logo.webp" alt="" />
                            <h3>Hi, I'm JARVIS</h3>
                            <p className="muted">Your AI colleague for customer meetings. Try for example:</p>
                            <div className="suggestions">
                                {SUGGESTIONS.map((suggestion) => (
                                    <button key={suggestion} className="chip" onClick={() => submit(suggestion)}>
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {entries.map((entry) => (
                        <MessageItem
                            key={entry.id}
                            entry={entry}
                            me={me}
                            onTyping={scrollToBottom}
                            onFollowUp={submit}
                        />
                    ))}

                    {sending && (
                        <div className="message assistant">
                            <img className="assistant-avatar" src="/db-logo.webp" alt="" />
                            <div className="message-main">
                                <div className="message-meta">
                                    <strong>JARVIS</strong>
                                    <span>is thinking...</span>
                                </div>
                                <div className="typing-dots">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            <form className="composer" onSubmit={handleSubmit}>
                <div className="composer-input">
                    <span className="composer-icon">
                        <Icon name="sparkle" />
                    </span>
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask JARVIS about a customer..."
                        maxLength={2000}
                        disabled={sending}
                        aria-label="Message"
                    />
                    <button type="submit" className="send-btn" disabled={sending || !input.trim()} aria-label="Send">
                        <Icon name="send" />
                    </button>
                </div>
                <button
                    type="button"
                    className={speech.listening ? 'mic-btn listening' : 'mic-btn'}
                    onClick={speech.toggle}
                    disabled={!speech.supported || sending}
                    title={speech.supported ? 'Voice input' : 'Voice input is not supported in this browser'}
                    aria-label="Voice input"
                    aria-pressed={speech.listening}
                >
                    <Icon name="mic" size={20} />
                </button>
            </form>
        </section>
    );
}