import { useCallback, useEffect, useState } from 'react';
import { fetchMe, login, logout } from './api/auth';
import { closeConversation, fetchConversations, fetchMessages, sendMessage, setConversationSaved } from './api/chat';
import { ApiError } from './api/http';
import { forgetConversation, mergeWithCache, saveConversation } from './chatCache';
import { ChatPanel } from './components/ChatPanel';
import { ConversationList, type ListTab } from './components/ConversationList';
import { CustomerPanel } from './components/CustomerPanel';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { useTheme } from './hooks/useTheme';
import { applyMockBriefing } from './mock/mockBriefings';
import type { ChatEntry, Conversation, CustomerBriefing, Me } from './types';

/** The "JARVIS is thinking" indicator stays at least this long, even when the answer comes instantly. */
const MIN_THINKING_MS = 2500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns a message to show; on an expired session it redirects to the login page. */
function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    login();
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}

function errorEntry(error: unknown): ChatEntry {
  return { id: crypto.randomUUID(), role: 'error', content: errorMessage(error), createdAt: new Date().toISOString() };
}

export default function App() {
  const { theme, setTheme } = useTheme();

  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [tab, setTab] = useState<ListTab>('chats');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMe()
      .then(setMe)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not reach the server'))
      .finally(() => setLoading(false));
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setConversations(await fetchConversations());
    } catch (e) {
      errorMessage(e);
    }
  }, []);

  useEffect(() => {
    if (me) {
      void loadConversations();
    }
  }, [me, loadConversations]);

  // remember the cards of the open conversation, so they come back when it is reopened
  useEffect(() => {
    if (activeId && entries.length > 0 && !loadingMessages) {
      saveConversation(activeId, entries);
    }
  }, [activeId, entries, loadingMessages]);

  async function openConversation(conversationId: string) {
    if (sending || conversationId === activeId) {
      return;
    }
    setActiveId(conversationId);
    setEntries([]);
    setLoadingMessages(true);
    try {
      const messages = await fetchMessages(conversationId);
      const fromServer: ChatEntry[] = messages.map((message) => ({
        id: message.id,
        role: message.role === 'USER' ? 'user' : 'assistant',
        content: message.content,
        createdAt: message.createdAt,
      }));
      setEntries(mergeWithCache(conversationId, fromServer));
    } catch (e) {
      setEntries([errorEntry(e)]);
    } finally {
      setLoadingMessages(false);
    }
  }

  function startNewChat() {
    if (sending) {
      return;
    }
    setActiveId(null);
    setEntries([]);
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || sending) {
      return;
    }

    setEntries((previous) => [
      ...previous,
      { id: crypto.randomUUID(), role: 'user', content: message, createdAt: new Date().toISOString() },
    ]);
    setSending(true);

    try {
      const [rawResponse] = await Promise.all([sendMessage(message, activeId), delay(MIN_THINKING_MS)]);
      const response = applyMockBriefing(message, rawResponse);
      setEntries((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.reply,
          createdAt: new Date().toISOString(),
          source: response.source,
          citedSources: response.citedSources,
          briefing: response.briefing ?? null,
          followUps: response.followUps ?? [],
          animate: true,
        },
      ]);
      setActiveId(response.conversationId);
      void loadConversations();
    } catch (e) {
      setEntries((previous) => [...previous, errorEntry(e)]);
    } finally {
      setSending(false);
    }
  }

  async function toggleSaved(conversation: Conversation) {
    try {
      const updated = await setConversationSaved(conversation.id, !conversation.saved);
      setConversations((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
    } catch (e) {
      errorMessage(e);
    }
  }

  async function closeChat(conversation: Conversation) {
    if (!conversation.saved && !window.confirm('Close this chat? It is not saved, so it will disappear from your list.')) {
      return;
    }
    try {
      const updated = await closeConversation(conversation.id);
      if (!updated.saved) {
        forgetConversation(updated.id);
      }
      setConversations((previous) =>
        updated.saved
          ? previous.map((item) => (item.id === updated.id ? updated : item))
          : previous.filter((item) => item.id !== updated.id),
      );
      if (conversation.id === activeId) {
        setActiveId(null);
        setEntries([]);
      }
    } catch (e) {
      errorMessage(e);
    }
  }

  if (loading) {
    return <div className="center-screen">Loading...</div>;
  }
  if (error) {
    return <div className="center-screen">{error}</div>;
  }
  if (!me) {
    return <LoginScreen />;
  }

  const activeConversation = conversations.find((conversation) => conversation.id === activeId) ?? null;

  // the most recent customer briefing in this conversation feeds the Customer 360 panel
  const customerBriefing =
    [...entries]
      .reverse()
      .map((entry) => entry.briefing)
      .find((briefing): briefing is CustomerBriefing => briefing?.kind === 'CUSTOMER') ?? null;

  return (
    <div className="app-shell">
      <div className={customerBriefing ? 'app with-panel' : 'app'}>
        <Sidebar me={me} theme={theme} onThemeChange={setTheme} onLogout={() => void logout()} />
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          tab={tab}
          search={search}
          onTabChange={setTab}
          onSearchChange={setSearch}
          onSelect={(conversationId) => void openConversation(conversationId)}
          onNewChat={startNewChat}
          onClose={(conversation) => void closeChat(conversation)}
        />
        <ChatPanel
          me={me}
          conversation={activeConversation}
          contextName={customerBriefing?.customer.name ?? null}
          entries={entries}
          sending={sending}
          loading={loadingMessages}
          onSend={(text) => void send(text)}
          onToggleSaved={(conversation) => void toggleSaved(conversation)}
          onClose={(conversation) => void closeChat(conversation)}
        />
        {customerBriefing && <CustomerPanel briefing={customerBriefing} />}
      </div>
    </div>
  );
}