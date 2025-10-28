import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Source and destination paths
const nitroOutput = path.join(__dirname, '../.output/public/_nuxt');
const distDir = path.join(__dirname, '../dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy index.js to dist root
const indexPath = path.join(nitroOutput, 'index.js');
if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, path.join(distDir, 'index.js'));
  console.log('✓ Copied index.js to dist/');
}

// Copy other JS files to dist root
const files = fs.readdirSync(nitroOutput);
files.forEach(file => {
  if (file.endsWith('.js') && file !== 'index.js') {
    fs.copyFileSync(
      path.join(nitroOutput, file),
      path.join(distDir, file)
    );
  }
});

// Copy CSS files to styles directory
const stylesDir = path.join(distDir, 'styles');
if (!fs.existsSync(stylesDir)) {
  fs.mkdirSync(stylesDir, { recursive: true });
}

files.forEach(file => {
  if (file.endsWith('.css')) {
    fs.copyFileSync(
      path.join(nitroOutput, file),
      path.join(stylesDir, file)
    );
  }
});

console.log('✓ Build files organized in dist/');