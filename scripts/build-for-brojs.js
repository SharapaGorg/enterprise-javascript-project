import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read package.json to get name and version
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const projectName = packageJson.name;
const version = process.env.VERSION || packageJson.version || '1.0.0';

// Create BroJS-compatible output directory structure
const outputDir = path.join(__dirname, '../dist');
const staticDir = path.join(outputDir, 'static', projectName, version);

// Clean and create directories
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(staticDir, { recursive: true });

// Copy all files from .nuxt/dist/client to the static directory
const clientDir = path.join(__dirname, '../.nuxt/dist/client');
if (fs.existsSync(clientDir)) {
  // Copy all files to the BroJS static directory
  fs.cpSync(clientDir, staticDir, { recursive: true });
}

// Copy index.html to the root of dist (BroJS needs it there)
const outputPublic = path.join(__dirname, '../.output/public');
if (fs.existsSync(outputPublic)) {
  const indexHtml = path.join(outputPublic, 'index.html');
  if (fs.existsSync(indexHtml)) {
    let html = fs.readFileSync(indexHtml, 'utf8');
    
    // Update all asset paths to point to the BroJS static directory
    const staticPath = `/static/${projectName}/${version}`;
    
    // Replace _nuxt references with the static path
    html = html.replace(/\/_nuxt\//g, `${staticPath}/`);
    html = html.replace(/\/styles\//g, `${staticPath}/styles/`);
    html = html.replace(/src="\/index\.js"/g, `src="${staticPath}/index.js"`);
    html = html.replace(/href="\/index\.js"/g, `href="${staticPath}/index.js"`);
    
    // Update the build configuration in the HTML
    html = html.replace(/buildAssetsDir:"[^"]*"/g, `buildAssetsDir:"${staticPath}/"`);
    
    // Write the updated HTML to dist root
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
  }
  
  // Copy other HTML files (for routes)
  const copyHtmlFiles = (source, target) => {
    const items = fs.readdirSync(source);
    items.forEach(item => {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);
      
      if (fs.statSync(sourcePath).isDirectory() && item !== '_nuxt') {
        fs.mkdirSync(targetPath, { recursive: true });
        copyHtmlFiles(sourcePath, targetPath);
      } else if (item.endsWith('.html') && item !== 'index.html') {
        let html = fs.readFileSync(sourcePath, 'utf8');
        const staticPath = `/static/${projectName}/${version}`;
        html = html.replace(/\/_nuxt\//g, `${staticPath}/`);
        html = html.replace(/\/styles\//g, `${staticPath}/styles/`);
        html = html.replace(/buildAssetsDir:"[^"]*"/g, `buildAssetsDir:"${staticPath}/"`);
        fs.writeFileSync(targetPath, html);
      }
    });
  };
  
  copyHtmlFiles(outputPublic, outputDir);
}

// Create a simple routing file for BroJS (if needed)
const routingConfig = {
  name: projectName,
  version: version,
  routes: {
    '/': '/index.html',
    '/auth/login': '/auth/login.html',
    '/auth/register': '/auth/register.html',
    '/books': '/books/index.html',
    '/profile': '/profile/index.html'
  }
};

fs.writeFileSync(
  path.join(outputDir, 'routes.json'), 
  JSON.stringify(routingConfig, null, 2)
);

console.log(`✓ Build complete for BroJS!`);
console.log(`  Project: ${projectName}`);
console.log(`  Version: ${version}`);
console.log(`  Output: dist/static/${projectName}/${version}/`);
console.log(`  Entry: dist/index.html`);