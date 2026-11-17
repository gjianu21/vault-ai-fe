/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_USE_MOCK_BRIEFINGS?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}