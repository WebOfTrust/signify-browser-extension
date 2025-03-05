import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import { copyFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
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

// Plugin to copy workflow files to the output directory
const copyWorkflowFiles = () => {
  return {
    name: 'copy-workflow-files',
    // Use buildStart to verify files exist before build starts
    buildStart: async () => {
      const workflowFile = resolve(__dirname, 'src/workflows/create-client-workflow.yaml');
      const configFile = resolve(__dirname, 'src/user_config/create-client-config.json');
      
      if (!existsSync(workflowFile)) {
        console.error(`Warning: Workflow file not found at ${workflowFile}`);
        return;
      }
      
      if (!existsSync(configFile)) {
        console.error(`Warning: Config file not found at ${configFile}`);
        return;
      }
      
      console.log('Workflow and config files found and will be included in build');
    },
    // Use writeBundle instead of closeBundle as it runs for each bundle
    writeBundle: async () => {
      try {
        const workflowDir = resolve(outDir, 'src/workflows');
        const configDir = resolve(outDir, 'src/user_config');
        
        // Ensure target directories exist
        await mkdir(workflowDir, { recursive: true });
        await mkdir(configDir, { recursive: true });
        
        // Copy workflow file
        const workflowSrc = resolve(__dirname, 'src/workflows/create-client-workflow.yaml');
        const workflowDest = resolve(workflowDir, 'create-client-workflow.yaml');
        await copyFile(workflowSrc, workflowDest);
        
        // Copy config file
        const configSrc = resolve(__dirname, 'src/user_config/create-client-config.json');
        const configDest = resolve(configDir, 'create-client-config.json');
        await copyFile(configSrc, configDest);
        
        console.log('Successfully copied workflow and config files to build directory');
      } catch (error) {
        console.error('Error copying workflow files:', error);
      }
    }
  };
};

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
    copyWorkflowFiles(),
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
