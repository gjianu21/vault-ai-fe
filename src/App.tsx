import { useEffect, useState } from 'react';
import { fetchMe, logout } from './api/auth';
import { ChatPanel } from './components/ChatPanel';
import { LoginScreen } from './components/LoginScreen';
import type { Me } from './types';

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe()
      .then(setMe)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not reach the server'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="center-screen">Loading...</div>;
  }
  if (error) {
    return <div className="center-screen">{error}</div>;
  }
  if (!me) {
    return <LoginScreen />;
  }

  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">&#9670;</span> Vault AI
        </div>
        <div className="topbar-user">
          <span>{me.email}</span>
          <button className="btn secondary" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </header>

      <main className="content">
        <ChatPanel />
      </main>
    </div>
  );
}