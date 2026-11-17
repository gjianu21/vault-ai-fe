import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'vault-ai-theme';

function initialTheme(): Theme {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
            return stored;
        }
    } catch {
        // storage not available: fall back to the system preference
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** The theme is an attribute on <html>; index.css switches all colors from it. */
export function useTheme() {
    const [theme, setTheme] = useState<Theme>(initialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // the theme still works, it is just not remembered
        }
    }, [theme]);

    return { theme, setTheme };
}