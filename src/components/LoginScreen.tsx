import { login } from '../api/auth';

export function LoginScreen() {
    const loginFailed = new URLSearchParams(window.location.search).has('loginError');

    return (
        <div className="login-screen">
            <div className="login-card">
                <div className="brand">
                    <span className="brand-mark">&#9670;</span> Vault AI
                </div>
                <h1>Your AI banking assistant</h1>
                <p className="muted">
                    Check your balance, review transactions and prepare transfers by chatting.
                    Every money movement needs your explicit confirmation.
                </p>
                {loginFailed && <div className="alert error">Sign in failed. Please try again.</div>}
                <button className="btn primary wide" onClick={login}>
                    Sign in
                </button>
                <p className="hint">New here? You can create an account on the sign-in page.</p>
            </div>
        </div>
    );
}