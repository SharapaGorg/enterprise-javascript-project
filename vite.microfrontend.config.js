import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'single-spa-entry.js'),
      output: {
        format: 'umd',
        name: 'readmind',
        entryFileNames: 'index.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        dir: 'dist'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false // Временно отключим для отладки
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'app'),
      '~': resolve(__dirname)
    }
  }
})