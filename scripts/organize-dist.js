import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure dist directory exists
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy files from .nuxt/dist/client to dist
const clientDir = path.join(__dirname, '../.nuxt/dist/client');
if (fs.existsSync(clientDir)) {
  const files = fs.readdirSync(clientDir);
  
  files.forEach(file => {
    const sourcePath = path.join(clientDir, file);
    
    if (fs.statSync(sourcePath).isFile()) {
      // Copy all JS and CSS files to dist root
      if (file.endsWith('.js') || file.endsWith('.css')) {
        fs.copyFileSync(sourcePath, path.join(distDir, file));
      }
    }
  });
  
  // Copy styles subdirectory if exists
  const stylesDir = path.join(clientDir, 'styles');
  if (fs.existsSync(stylesDir)) {
    const distStylesDir = path.join(distDir, 'styles');
    fs.mkdirSync(distStylesDir, { recursive: true });
    fs.cpSync(stylesDir, distStylesDir, { recursive: true });
  }
}

// Copy HTML files from .output/public
const outputPublic = path.join(__dirname, '../.output/public');
if (fs.existsSync(outputPublic)) {
  const copyHtmlFiles = (sourceDir, targetDir) => {
    const items = fs.readdirSync(sourceDir);
    
    items.forEach(item => {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);
      
      if (fs.statSync(sourcePath).isDirectory() && item !== '_nuxt') {
        fs.mkdirSync(targetPath, { recursive: true });
        copyHtmlFiles(sourcePath, targetPath);
      } else if (item.endsWith('.html') || item === 'nitro.json') {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  };
  
  copyHtmlFiles(outputPublic, distDir);
}

// Fix paths in index.html
const indexHtml = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtml)) {
  let html = fs.readFileSync(indexHtml, 'utf8');
  
  // Update paths to remove _nuxt directory
  html = html.replace(/\/_nuxt\//g, '/');
  
  fs.writeFileSync(indexHtml, html);
}

console.log('✓ Build organized in dist/ with index.js at root');