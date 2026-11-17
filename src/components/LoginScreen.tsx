import { login } from '../api/auth';

export function LoginScreen() {
    const loginFailed = new URLSearchParams(window.location.search).has('loginError');

    return (
        <div className="login-screen">
            <div className="login-card">
                <div className="login-brand">
                    <img src="/db-logo.webp" alt="Deutsche Bank" />
                    <span>Vault AI</span>
                </div>
                <h1>Meet JARVIS</h1>
                <p className="muted">
                    Your AI banking colleague. Stop searching, start asking: get a complete customer briefing before
                    every meeting.
                </p>
                {loginFailed && <div className="alert error">Sign in failed. Please try again.</div>}
                <button className="btn primary wide" onClick={login}>
                    Sign in
                </button>
            </div>
        </div>
    );
}