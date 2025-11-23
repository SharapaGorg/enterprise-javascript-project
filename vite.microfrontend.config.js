import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'inline-css',
      generateBundle(options, bundle) {
        // Найти CSS файл и встроить его в JS
        const cssFiles = Object.keys(bundle).filter(key => key.endsWith('.css'))
        const jsFiles = Object.keys(bundle).filter(key => key.endsWith('.js'))
        
        if (cssFiles.length > 0 && jsFiles.length > 0) {
          const cssFile = bundle[cssFiles[0]]
          const jsFile = bundle[jsFiles[0]]
          
          // Добавить CSS инъекцию в начало JS файла
          const cssInjectCode = `
(function() {
  var css = ${JSON.stringify(cssFile.source)};
  var style = document.createElement('style');
  style.type = 'text/css';
  style.textContent = css;
  document.head.appendChild(style);
})();
`
          jsFile.code = cssInjectCode + jsFile.code
          
          // Удалить CSS файл из bundle
          delete bundle[cssFiles[0]]
        }
      }
    }
  ],
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
        inlineDynamicImports: true,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'style.css';
          }
          return assetInfo.name;
        }
      },
    },
    outDir: "./dist",
    emptyOutDir: false,
    minify: false,
    cssCodeSplit: false,
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
