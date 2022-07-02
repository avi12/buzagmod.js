import { chrome } from "../../.electron-vendors.cache.json";
import { builtinModules } from "module";

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: __dirname,
  envDir: process.cwd(),
  build: {
    sourcemap: "inline",
    target: `chrome${chrome}`,
    outDir: "dist",
    assetsDir: ".",
    minify: process.env.MODE !== "development",
    lib: {
      entry: "src/index.ts",
      formats: ["cjs"]
    },
    rollupOptions: {
      external: ["electron", ...builtinModules.flatMap(p => [p, `node:${p}`])],
      output: {
        entryFileNames: "[name].cjs"
      }
    },
    emptyOutDir: true,
    brotliSize: false
  }
};

export default config;
