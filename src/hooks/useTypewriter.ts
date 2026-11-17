import { useEffect, useRef, useState } from 'react';

const TARGET_DURATION_MS = 8000;
const TICK_MS = 30;

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Reveals the text progressively. Long texts use bigger steps, so any reply takes about 3 seconds.
 * onTick is called on every step (used to keep the chat scrolled to the bottom).
 */
export function useTypewriter(text: string, enabled: boolean, onTick?: () => void) {
    const [visible, setVisible] = useState(() => (enabled && !prefersReducedMotion() ? 0 : text.length));
    const done = visible >= text.length;

    const onTickRef = useRef(onTick);
    useEffect(() => {
        onTickRef.current = onTick;
    });

    useEffect(() => {
        if (done) {
            return;
        }
        const step = Math.max(1, Math.ceil(text.length / (TARGET_DURATION_MS / TICK_MS)));
        const timer = window.setInterval(() => {
            setVisible((current) => Math.min(text.length, current + step));
            onTickRef.current?.();
        }, TICK_MS);

        return () => window.clearInterval(timer);
    }, [done, text.length]);

    return {
        visibleText: text.slice(0, visible),
        done,
        skip: () => setVisible(text.length),
    };
}