import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'node:fs';
import path from 'node:path';

// Inlines the favicon as a data URI so the single-file preview makes ZERO
// external asset requests (JS/CSS are inlined by vite-plugin-singlefile).
function inlineFavicon() {
  return {
    name: 'inline-favicon',
    transformIndexHtml: {
      order: 'post' as const,
      handler(html: string) {
        const svgPath = path.resolve(__dirname, 'public/favicon.svg');
        const svg = fs.readFileSync(svgPath, 'utf-8');
        const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
        return html.replace(/href="[^"]*favicon\.svg"/g, `href="${dataUri}"`);
      },
    },
  };
}

// Dedicated build that inlines every JS/CSS asset into a single self-contained
// index.html for the zero-dependency live preview.
export default defineConfig({
  plugins: [react(), viteSingleFile(), inlineFavicon()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-preview',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
