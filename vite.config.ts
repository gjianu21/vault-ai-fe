import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const BACKEND_URL = 'http://localhost:8080';

// Every backend call goes through this proxy, so the browser sees a single origin
// (localhost:5173): no CORS, and the session cookie works normally.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': BACKEND_URL,
      '/graphql': BACKEND_URL,
      '/oauth2': BACKEND_URL,
      '/login/oauth2': BACKEND_URL,
    },
  },
});