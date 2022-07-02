/* eslint-env node */

import { chrome } from "../../.electron-vendors.cache.json";
import { builtinModules } from "module";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import * as path from "path";
import sveltePreprocess from "svelte-preprocess";

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      "/@/": `${path.join(PACKAGE_ROOT, "src")}/`
    }
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess()
    })
  ],
  base: "",
  server: {
    fs: {
      strict: true
    }
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: "dist",
    assetsDir: ".",
    rollupOptions: {
      input: path.join(PACKAGE_ROOT, "index.html"),
      external: [...builtinModules.flatMap(p => [p, `node:${p}`])]
    },
    emptyOutDir: true,
    brotliSize: false
  },
  test: {
    environment: "happy-dom"
  }
};

export default config;
