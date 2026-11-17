import { formatListDate } from '../format';
import type { Conversation } from '../types';
import { Icon } from './Icon';

export type ListTab = 'chats' | 'saved';

interface Props {
    conversations: Conversation[];
    activeId: string | null;
    tab: ListTab;
    search: string;
    onTabChange: (tab: ListTab) => void;
    onSearchChange: (value: string) => void;
    onSelect: (conversationId: string) => void;
    onNewChat: () => void;
    onClose: (conversation: Conversation) => void;
}

export function ConversationList({
    conversations,
    activeId,
    tab,
    search,
    onTabChange,
    onSearchChange,
    onSelect,
    onNewChat,
    onClose,
}: Props) {
    const openCount = conversations.filter((conversation) => !conversation.closed).length;
    const savedCount = conversations.filter((conversation) => conversation.saved).length;
    const query = search.trim().toLowerCase();
    const visible = conversations
        .filter((conversation) => (tab === 'chats' ? !conversation.closed : conversation.saved))
        .filter((conversation) => !query || conversation.title.toLowerCase().includes(query));

    return (
        <aside className="conversations">
            <div className="conversations-header">
                <h1>My Chats</h1>
                <button className="icon-btn accent" onClick={onNewChat} title="New chat" aria-label="New chat">
                    <Icon name="plus" />
                </button>
            </div>

            <div className="tabs" role="tablist">
                <button
                    role="tab"
                    aria-selected={tab === 'chats'}
                    className={tab === 'chats' ? 'tab active' : 'tab'}
                    onClick={() => onTabChange('chats')}
                >
                    <Icon name="chat" size={14} /> Chats <span className="count">{openCount}</span>
                </button>
                <button
                    role="tab"
                    aria-selected={tab === 'saved'}
                    className={tab === 'saved' ? 'tab active' : 'tab'}
                    onClick={() => onTabChange('saved')}
                >
                    <Icon name="bookmark" size={14} /> Saved <span className="count">{savedCount}</span>
                </button>
            </div>

            <label className="search">
                <Icon name="search" size={16} />
                <input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search..."
                    aria-label="Search chats"
                />
            </label>

            <ul className="conversation-items">
                {visible.length === 0 && (
                    <li className="empty">
                        {tab === 'saved'
                            ? 'No saved chats yet. Use the bookmark button in a chat to save it.'
                            : 'No chats yet. Start one with the + button.'}
                    </li>
                )}

                {visible.map((conversation) => (
                    <li key={conversation.id} className="conversation-row">
                        <button
                            className={conversation.id === activeId ? 'conversation-item active' : 'conversation-item'}
                            onClick={() => onSelect(conversation.id)}
                        >
                            <span className="conversation-title">
                                {conversation.saved && <Icon name="bookmark" size={13} filled />}
                                <span>{conversation.title}</span>
                            </span>
                            <span className="conversation-time">
                                {conversation.closed ? 'Closed' : formatListDate(conversation.updatedAt)}
                            </span>
                        </button>

                        {!conversation.closed && (
                            <button
                                className="row-close"
                                onClick={() => onClose(conversation)}
                                title="Close chat"
                                aria-label={`Close ${conversation.title}`}
                            >
                                <Icon name="close" size={14} />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
}