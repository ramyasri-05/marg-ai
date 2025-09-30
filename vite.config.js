// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    // REMOVE: viteStaticCopy(...) plugin entry here
  ],
  // REMOVE: path import and resolve block if still present
});