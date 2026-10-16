import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'dist-temp-standalone');
const finalDir = path.resolve(rootDir, 'standalone');

async function buildStandalone() {
  console.log('Building ASK Dairy Management standalone bundle...');

  // 1. Run Vite build with all assets inlined and single chunk
  await build({
    root: rootDir,
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': rootDir,
      },
    },
    build: {
      outDir: outDir,
      emptyOutDir: true,
      assetsInlineLimit: 50 * 1024 * 1024, // 50MB limit to inline all images & icons as base64
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          format: 'iife',
          name: 'AskDairyApp',
          inlineDynamicImports: true,
        },
      },
    },
  });

  console.log('Vite build complete. Reading generated files for single-file inlining...');

  const htmlPath = path.join(outDir, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Find generated assets
  const assetsDir = path.join(outDir, 'assets');
  const assetFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];

  const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
  const cssFiles = assetFiles.filter(f => f.endsWith('.css'));

  console.log(`Found ${jsFiles.length} JS file(s) and ${cssFiles.length} CSS file(s).`);

  // Inline CSS
  let combinedCss = '';
  for (const cssFile of cssFiles) {
    const cssPath = path.join(assetsDir, cssFile);
    combinedCss += fs.readFileSync(cssPath, 'utf8') + '\n';
  }

  // Inline JS
  let combinedJs = '';
  for (const jsFile of jsFiles) {
    const jsPath = path.join(assetsDir, jsFile);
    combinedJs += fs.readFileSync(jsPath, 'utf8') + '\n';
  }

  // Remove existing CSS link tags
  html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, '');

  // Remove existing JS script module tags that point to assets
  html = html.replace(/<script[^>]+type=["']module["'][^>]+src=["'][^"']*\/assets\/[^"']*["'][^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]+src=["'][^"']*\/assets\/[^"']*["'][^>]*><\/script>/gi, '');

  // Inline SVG logo for favicon if present
  const svgLogoPath = path.join(rootDir, 'public', 'ask_logo.svg');
  if (fs.existsSync(svgLogoPath)) {
    const svgContent = fs.readFileSync(svgLogoPath, 'utf8');
    const base64Svg = Buffer.from(svgContent).toString('base64');
    const svgDataUri = `data:image/svg+xml;base64,${base64Svg}`;
    html = html.replace(/<link[^>]+rel=["']icon["'][^>]*>/gi, `<link rel="icon" type="image/svg+xml" href="${svgDataUri}">`);
    html = html.replace(/<link[^>]+rel=["']apple-touch-icon["'][^>]*>/gi, `<link rel="apple-touch-icon" href="${svgDataUri}">`);
  }

  // Clean title & add fallback styles for local file:// execution
  if (!html.includes('<title>')) {
    html = html.replace('<head>', '<head>\n    <title>ASK Dairy Management</title>');
  }

  // Inject inlined CSS in <head>
  const styleTag = `\n    <style id="ask-dairy-inlined-styles">\n${combinedCss}    </style>\n  </head>`;
  html = html.replace('</head>', styleTag);

  // Inject inlined JS before </body> as universal classic script for 100% offline file:// compatibility
  const safeJs = combinedJs.replace(/<\/script>/gi, '<\\/script>');
  const scriptTag = `\n    <script id="ask-dairy-inlined-app">\n${safeJs}\n    </script>\n  </body>`;
  html = html.replace('</body>', scriptTag);

  // Ensure output directory exists
  if (!fs.existsSync(finalDir)) {
    fs.mkdirSync(finalDir, { recursive: true });
  }

  const finalHtmlPath = path.join(finalDir, 'index.html');
  fs.writeFileSync(finalHtmlPath, html, 'utf8');

  // Also clean up temp directory
  fs.rmSync(outDir, { recursive: true, force: true });

  const stats = fs.statSync(finalHtmlPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`SUCCESS: Single self-contained HTML file created at: ${finalHtmlPath}`);
  console.log(`Total self-contained file size: ${sizeMb} MB`);
}

buildStandalone().catch(err => {
  console.error('Error creating standalone bundle:', err);
  process.exit(1);
});
