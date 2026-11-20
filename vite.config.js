import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const staticDirectories = [
  'about',
  'assets',
  'committee-rulebook',
  'contact',
  'contribute',
  'contributions',
  'countries',
  'data',
  'events',
  'global-members',
  'initiatives',
  'leadership',
  'member-countries',
  'members',
  'membership',
  'news',
  'news-events',
  'policy-research',
  'privacy',
  'publications',
  'reader-charter',
  '.well-known',
  'src',
];

export default defineConfig({
  root: __dirname,
  publicDir: path.resolve(__dirname, 'public'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  plugins: [
    {
      name: 'copy-static-site-directories',
      apply: 'build',
      closeBundle(error) {
        if (error) return;
        const distDir = path.resolve(__dirname, 'dist');
        fs.mkdirSync(distDir, { recursive: true });
        for (const dir of staticDirectories) {
          const srcDir = path.resolve(__dirname, dir);
          if (!fs.existsSync(srcDir)) continue;
          const destDir = path.resolve(distDir, dir);
          fs.mkdirSync(destDir, { recursive: true });
          fs.cpSync(srcDir, destDir, { recursive: true, force: true });
        }
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
