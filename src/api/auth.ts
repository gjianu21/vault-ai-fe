import type { Me } from '../types';
import { ApiError, apiFetch, ensureCsrfToken } from './http';

/** The logged-in user, or null if there is no session. */
export async function fetchMe(): Promise<Me | null> {
    try {
        return await apiFetch<Me>('/api/auth/me');
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return null;
        }
        throw error;
    }
}

/** Full page navigation: backend -> auth-server login page -> back to the app. */
export function login(): void {
    window.location.href = '/oauth2/authorization/vault-ai';
}

/**
 * Logout is a real form POST (not fetch): the browser must follow the redirects
 * to the auth-server (to end that session too) and then back to the app.
 */
export async function logout(): Promise<void> {
    const token = await ensureCsrfToken();

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/auth/logout';

    const csrf = document.createElement('input');
    csrf.type = 'hidden';
    csrf.name = '_csrf';
    csrf.value = token;

    form.appendChild(csrf);
    document.body.appendChild(form);
    form.submit();
}