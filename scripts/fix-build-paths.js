import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fix paths in all JS files
function fixJsPaths(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace _nuxt references with current directory
      content = content.replace(/\/_nuxt\//g, '/');
      content = content.replace(/buildAssetsDir:"[^"]+"/g, 'buildAssetsDir:""');
      content = content.replace(/baseURL:"\/read-mind-ai\/"/g, 'baseURL:"/"');
      
      fs.writeFileSync(filePath, content);
    }
  });
}

// Fix HTML file
function fixHtmlPaths(htmlPath) {
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Remove base path and _nuxt references
    html = html.replace(/\/read-mind-ai\//g, '/');
    html = html.replace(/\/_nuxt\//g, '/');
    
    // Update config in HTML
    html = html.replace(/baseURL:"\/read-mind-ai\/"/g, 'baseURL:"/"');
    html = html.replace(/buildAssetsDir:"[^"]+"/g, 'buildAssetsDir:""');
    
    fs.writeFileSync(htmlPath, html);
  }
}

const distDir = path.join(__dirname, '../dist');

console.log('Fixing build paths...');
fixJsPaths(distDir);
fixHtmlPaths(path.join(distDir, 'index.html'));

// Also fix HTML files in subdirectories
const subdirs = ['auth', 'books', 'profile'];
subdirs.forEach(dir => {
  const subdir = path.join(distDir, dir);
  if (fs.existsSync(subdir)) {
    fs.readdirSync(subdir).forEach(file => {
      if (file.endsWith('.html')) {
        fixHtmlPaths(path.join(subdir, file));
      }
    });
  }
});

console.log('✓ Build paths fixed');