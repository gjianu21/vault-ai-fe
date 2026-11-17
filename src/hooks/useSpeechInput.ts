import { useRef, useState } from 'react';

interface SpeechRecognitionEventLike {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
    lang: string;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const speechWindow = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
};
const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

/** Browser speech-to-text (Chrome and Edge). The recognized text goes to onText. */
export function useSpeechInput(onText: (text: string) => void) {
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

    function toggle() {
        if (!Recognition) {
            return;
        }
        if (listening) {
            recognitionRef.current?.stop();
            return;
        }

        const recognition = new Recognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.onresult = (event) => {
            const text = Array.from(event.results).map((result) => result[0].transcript).join(' ');
            onText(text);
        };
        recognition.onend = () => setListening(false);
        recognition.onerror = () => setListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
    }

    return { supported: Boolean(Recognition), listening, toggle };
}