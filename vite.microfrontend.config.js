import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, "single-spa-entry.js"),
      name: "ReadMindAI",
      formats: ["umd"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    outDir: "./dist",
    emptyOutDir: false,
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
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "app"),
      "~": resolve(__dirname),
    },
  },
});
