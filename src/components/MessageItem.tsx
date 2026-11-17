import { useState } from 'react';
import { formatTime, initials } from '../format';
import { useTypewriter } from '../hooks/useTypewriter';
import type { ChatEntry, Me } from '../types';
import { AttentionList } from './AttentionList';
import { BriefingCard } from './BriefingCard';
import { Icon } from './Icon';
import { SourceChip } from './SourceChip';

interface Props {
    entry: ChatEntry;
    me: Me;
    onTyping?: () => void;
    onFollowUp?: (text: string) => void;
}

export function MessageItem({ entry, me, onTyping, onFollowUp }: Props) {
    const [copied, setCopied] = useState(false);
    // hooks must run on every render, so the typewriter exists even for user messages (it just does nothing)
    const typewriter = useTypewriter(entry.content, entry.role === 'assistant' && Boolean(entry.animate), onTyping);

    async function copy() {
        try {
            await navigator.clipboard.writeText(entry.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard not available (for example on plain http outside localhost)
        }
    }

    if (entry.role === 'error') {
        return (
            <div className="message error">
                <div className="error-bubble">{entry.content}</div>
            </div>
        );
    }

    if (entry.role === 'user') {
        return (
            <div className="message user">
                <div className="avatar small">{initials(me.email)}</div>
                <div className="message-main">
                    <div className="message-meta">
                        <strong>You</strong>
                        <span>{formatTime(entry.createdAt)}</span>
                    </div>
                    <div className="user-bubble">{entry.content}</div>
                </div>
            </div>
        );
    }

    const briefing = entry.briefing ?? null;
    const showSourcesRow = !briefing && entry.citedSources && entry.citedSources.length > 0;

    return (
        <div className="message assistant">
            <img className="assistant-avatar" src="/db-logo.webp" alt="" />
            <div className="message-main">
                <div className="message-meta">
                    <strong>JARVIS</strong>
                    <span>{formatTime(entry.createdAt)}</span>
                    {entry.source === 'FALLBACK' && <span className="badge warning">Offline answer</span>}
                    {entry.source === 'MOCK' && <span className="badge">Mock</span>}
                    {entry.source === 'RULES' && <span className="badge">Rule-based</span>}
                </div>

                <div className="response-card">
                    <div
                        className={typewriter.done ? 'response-text' : 'response-text typing-cursor'}
                        onClick={typewriter.done ? undefined : typewriter.skip}
                        title={typewriter.done ? undefined : 'Click to show the full answer'}
                    >
                        {typewriter.visibleText}
                    </div>

                    {typewriter.done && showSourcesRow && (
                        <div className="sources">
                            <span className="muted small">Sources:</span>
                            {entry.citedSources!.map((source) => (
                                <SourceChip key={source} id={source} />
                            ))}
                        </div>
                    )}
                </div>

                {typewriter.done && briefing?.kind === 'CUSTOMER' && <BriefingCard briefing={briefing} />}
                {typewriter.done && briefing?.kind === 'ATTENTION' && <AttentionList briefing={briefing} />}

                {typewriter.done && (
                    <div className="message-actions reveal">
                        {entry.followUps?.map((followUp) => (
                            <button key={followUp} className="chip follow-up" onClick={() => onFollowUp?.(followUp)}>
                                <Icon name={followUp.toLowerCase().includes('invest') ? 'trending' : 'list'} size={14} />
                                {followUp}
                            </button>
                        ))}
                        <button className="ghost-btn" onClick={() => void copy()}>
                            <Icon name={copied ? 'check' : 'copy'} size={14} />
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}