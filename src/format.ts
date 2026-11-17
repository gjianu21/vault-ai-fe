const DAY_MS = 24 * 60 * 60 * 1000;

export function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** Today: 14:05, yesterday: Yesterday, this week: Mon, older: 17 Nov */
export function formatListDate(iso: string): string {
    const time = new Date(iso).getTime();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (time >= startOfToday) {
        return formatTime(iso);
    }
    if (time >= startOfToday - DAY_MS) {
        return 'Yesterday';
    }
    if (time >= startOfToday - 6 * DAY_MS) {
        return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short' });
    }
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** "ana.popescu@bank.com" -> "AP" */
export function initials(email: string): string {
    const parts = email.split('@')[0].split(/[._-]+/).filter(Boolean);
    const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : (parts[0] ?? '?').slice(0, 2);
    return letters.toUpperCase();
}

export function nameInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

export function capitalize(value: string): string {
    return value ? value[0].toUpperCase() + value.slice(1) : value;
}