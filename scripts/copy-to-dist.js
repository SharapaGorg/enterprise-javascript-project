import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Clean and create dist directory
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy HTML files from .output/public
const outputPublic = path.join(__dirname, '../.output/public');
if (fs.existsSync(outputPublic)) {
  const htmlFiles = fs.readdirSync(outputPublic);
  htmlFiles.forEach(file => {
    if (file.endsWith('.html') || file.endsWith('.json')) {
      fs.copyFileSync(
        path.join(outputPublic, file),
        path.join(distDir, file)
      );
    }
  });
  
  // Copy directories (auth, books, profile)
  const dirs = fs.readdirSync(outputPublic);
  dirs.forEach(dir => {
    const dirPath = path.join(outputPublic, dir);
    if (fs.statSync(dirPath).isDirectory() && dir !== '_nuxt') {
      fs.cpSync(dirPath, path.join(distDir, dir), { recursive: true });
    }
  });
}

// Copy JS and CSS files from .nuxt/dist/client
const clientDir = path.join(__dirname, '../.nuxt/dist/client');
if (fs.existsSync(clientDir)) {
  const files = fs.readdirSync(clientDir);
  
  // Copy index.js to root
  const indexJs = files.find(f => f === 'index.js');
  if (indexJs) {
    fs.copyFileSync(
      path.join(clientDir, indexJs),
      path.join(distDir, 'index.js')
    );
    console.log('✓ Copied index.js to dist/');
  }
  
  // Copy other JS files
  files.forEach(file => {
    if (file.endsWith('.js') && file !== 'index.js') {
      fs.copyFileSync(
        path.join(clientDir, file),
        path.join(distDir, file)
      );
    }
  });
  
  // Create styles directory and copy CSS
  const stylesDir = path.join(distDir, 'styles');
  fs.mkdirSync(stylesDir, { recursive: true });
  
  const stylesSubDir = path.join(clientDir, 'styles');
  if (fs.existsSync(stylesSubDir)) {
    fs.cpSync(stylesSubDir, stylesDir, { recursive: true });
  }
  
  // Copy any CSS in root of client dir
  files.forEach(file => {
    if (file.endsWith('.css')) {
      fs.copyFileSync(
        path.join(clientDir, file),
        path.join(stylesDir, file)
      );
    }
  });
}

// Update index.html to point to correct paths
const indexHtml = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtml)) {
  let html = fs.readFileSync(indexHtml, 'utf8');
  
  // Update script and link paths
  html = html.replace(/\/read-mind-ai\/_nuxt\//g, '/read-mind-ai/');
  html = html.replace(/href="\/read-mind-ai\/styles\//g, 'href="/read-mind-ai/styles/');
  html = html.replace(/src="\/read-mind-ai\/index\.js"/g, 'src="/read-mind-ai/index.js"');
  
  fs.writeFileSync(indexHtml, html);
  console.log('✓ Updated index.html paths');
}

console.log('✓ Build complete! Files copied to dist/');