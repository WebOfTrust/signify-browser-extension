import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
// import { crx, ManifestV3Export } from "@crxjs/vite-plugin";
// import merge from "lodash/merge";
// import { nodePolyfills } from "vite-plugin-node-polyfills";

// import manifest from "./manifest.json";
// import devManifest from "./manifest.dev.json";
// import pkg from "./package.json";

const rootDir = resolve(__dirname, "src");
const publicDir = resolve(__dirname, "public");
const isDev = process.env.__DEV__ === "false";
const targetBrowser = process.env.BROWSER || "chrome";
const outDir = resolve(__dirname, `dist/${targetBrowser}`);

function generateManifest() {
  const manifest = readJsonFile(`manifest.${targetBrowser}.json`);
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "@src": rootDir,
      "@assets": resolve(rootDir, "assets"),
      "@pages": resolve(rootDir, "pages"),
      "@components": resolve(rootDir, "components"),
      "@config": resolve(rootDir, "config"),
      "@shared": resolve(rootDir, "shared"),
    },
  },
  plugins: [
    react(),
    webExtension({
      manifest: generateManifest,
    }),
    // crx({
    //   manifest: extensionManifest as ManifestV3Export,
    //   contentScripts: {
    //     injectCss: true,
    //   },
    // }),
    // nodePolyfills(),
  ],
  publicDir,
  build: {
    outDir,
    sourcemap: isDev,
    emptyOutDir: false,
  },
});
