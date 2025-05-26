import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for Electron build
  build: {
    outDir: 'dist/renderer', // Output to a subdirectory in dist
    rollupOptions: {
        output: {
            // Ensure that the entry file is named renderer.js or similar
            // and that assets are handled correctly.
            entryFileNames: `assets/[name].js`,
            chunkFileNames: `assets/[name].js`,
            assetFileNames: `assets/[name].[ext]`
        }
    }
  },
  server: {
    port: 3000 // Port for Vite dev server
  }
});
