// Thin wrapper over fetch: sends the session cookie, adds the CSRF header
// on state-changing requests and turns backend errors (ProblemDetail) into ApiError.

export class ApiError extends Error {
    readonly status: number;
    readonly code?: string;

    constructor(status: number, message: string, code?: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

function readCookie(name: string): string | null {
    const row = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${name}=`));
    return row ? decodeURIComponent(row.substring(name.length + 1)) : null;
}

/** The backend writes the token in the XSRF-TOKEN cookie (readable by JS on purpose). */
export async function ensureCsrfToken(): Promise<string> {
    const existing = readCookie('XSRF-TOKEN');
    if (existing) {
        return existing;
    }
    const response = await fetch('/api/auth/csrf', { credentials: 'same-origin' });
    const body = (await response.json()) as { token: string };
    return body.token;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const method = (options.method ?? 'GET').toUpperCase();
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    if (method !== 'GET' && method !== 'HEAD') {
        headers.set('X-XSRF-TOKEN', await ensureCsrfToken());
    }

    const response = await fetch(path, { ...options, method, headers, credentials: 'same-origin' });

    if (response.status === 401) {
        throw new ApiError(401, 'Your session has expired. Please sign in again.');
    }
    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        let code: string | undefined;
        try {
            const problem = (await response.json()) as { detail?: string; message?: string; code?: string };
            message = problem.detail ?? problem.message ?? message;
            code = problem.code;
        } catch {
            // the body was not JSON: keep the generic message
        }
        throw new ApiError(response.status, message, code);
    }
    if (response.status === 204) {
        return undefined as T;
    }
    return (await response.json()) as T;
}