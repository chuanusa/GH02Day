const fs = require('fs');
const path = require('path');

const frontendDist = path.join(__dirname, 'frontend/dist');
const backendDir = path.join(__dirname, 'backend');
const indexPath = path.join(frontendDist, 'index.html');
const assetsDir = path.join(frontendDist, 'assets');

// Read index.html
let html = fs.readFileSync(indexPath, 'utf-8');

// Find JS and CSS files
const files = fs.readdirSync(assetsDir);
const jsFile = files.find(f => f.endsWith('.js'));
const cssFile = files.find(f => f.endsWith('.css'));

if (!jsFile || !cssFile) {
    console.error('Could not find JS or CSS files in assets directory');
    process.exit(1);
}

const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');
const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');

// Replace link tag with style tag
// The regex needs to be careful. The original index.html has:
// <link rel="stylesheet" crossorigin href="/assets/index-QnSWFYwV.css">
html = html.replace(/<link rel="stylesheet"[^>]+href="\/assets\/[^"]+\.css">/, `<style>${cssContent}</style>`);

// Replace script tag with script content
// <script type="module" crossorigin src="/assets/index-12ew7cQJ.js"></script>
html = html.replace(/<script type="module"[^>]+src="\/assets\/[^"]+\.js"><\/script>/, `<script>${jsContent}</script>`);

// Write to backend/Index.html
fs.writeFileSync(path.join(backendDir, 'Index.html'), html);
console.log('Successfully created backend/Index.html with inlined assets');
