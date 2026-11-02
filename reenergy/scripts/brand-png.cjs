// Genera PNG de íconos y logo a partir de los SVG de /public (requiere Playwright).
// Uso: node scripts/brand-png.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const pub = path.join(__dirname, '..', 'public');
const svg = (f) => fs.readFileSync(path.join(pub, f), 'utf8');
const jobs = [
  { out: 'favicon-32.png', w: 32, h: 32, html: svg('favicon.svg'), bg: 'transparent' },
  { out: 'apple-touch-icon.png', w: 180, h: 180, html: svg('favicon.svg'), bg: '#f9f6e4', pad: 18 },
  { out: 'icon-192.png', w: 192, h: 192, html: svg('favicon.svg'), bg: '#f9f6e4', pad: 16 },
  { out: 'icon-512.png', w: 512, h: 512, html: svg('favicon.svg'), bg: '#f9f6e4', pad: 48 },
  { out: 'brand/reenergy-logo.png', w: 1200, h: 300, html: svg('brand/reenergy-logo.svg'), bg: 'transparent', pad: 40 },
  { out: 'brand/reenergy-logo-azul.png', w: 1200, h: 300, html: svg('brand/reenergy-logo-azul.svg'), bg: '#1b47b2', pad: 40 },
];
(async () => {
  const b = await chromium.launch();
  for (const j of jobs) {
    const p = await b.newPage({ viewport: { width: j.w, height: j.h } });
    await p.setContent(`<html><body style="margin:0;background:${j.bg};display:grid;place-items:center;width:${j.w}px;height:${j.h}px;padding:${j.pad || 0}px;box-sizing:border-box">${j.html.replace('<svg', '<svg style="width:100%;height:100%"')}</body></html>`);
    await p.screenshot({ path: path.join(pub, j.out), omitBackground: j.bg === 'transparent' });
    await p.close();
    console.log('✓', j.out);
  }
  await b.close();
})();
