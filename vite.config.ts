import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import merge from 'lodash/merge';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import manifest from './manifest.json';
import devManifest from './manifest.dev.json';
import pkg from './package.json';

const root = resolve(__dirname, 'src');
const pagesDir = resolve(root, 'pages');
const assetsDir = resolve(root, 'assets');
const componentsDir = resolve(root, 'components');
const outDir = resolve(__dirname, 'dist');
const publicDir = resolve(__dirname, 'public');

const isDev = process.env.__DEV__ === 'false';

const extensionManifest = {
  ...merge(manifest, isDev ? devManifest : {}),
  manifest_version: 3,
  name: isDev ? `DEV: ${ pkg.displayName }` : pkg.displayName,
  description: pkg.description,
  version: pkg.version,
};

export default defineConfig({
  resolve: {
    alias: {
      '@src': root,
      '@assets': assetsDir,
      '@pages': pagesDir,
      '@components': componentsDir,
    },
  },
  plugins: [
    react(),
    crx(
      {
      manifest: extensionManifest as ManifestV3Export,
      contentScripts: {
        injectCss: true,
      }
    }
    ),
    nodePolyfills(),
  ],
  publicDir,
  build: {
    outDir,
    sourcemap: isDev,
    emptyOutDir: false,
  },
});
