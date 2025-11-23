import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: resolve(__dirname, "single-spa-entry.js"),
      output: {
        format: "umd",
        name: "ReadMindAI",
        dir: "./dist",
        entryFileNames: "index.js",
      },
      external: [],
    },
    outDir: "./dist",
    emptyOutDir: true,
    minify: false,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development",
    ),
    "process.env.SITE_URL": JSON.stringify(
      process.env.SITE_URL || "http://localhost:3000",
    ),
    "process.env": JSON.stringify({
      NODE_ENV: process.env.NODE_ENV || "development",
      SITE_URL: process.env.SITE_URL || "http://localhost:3000",
    }),
    "process.client": true,
    "process.server": false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "app"),
      "~": resolve(__dirname),
    },
  },
});
