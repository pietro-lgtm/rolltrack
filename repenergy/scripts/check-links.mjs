// Verifica que todos los enlaces internos de /dist apunten a páginas existentes
// y que cada página tenga su par de idioma (hreflang). Uso: npm run build && npm run check:links
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const dist = new URL('../dist/', import.meta.url).pathname;
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); });
walk(dist);
let bad = 0;
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const hrefs = [...html.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]);
  for (const h of hrefs) {
    const target = h.endsWith('/') ? join(dist, h, 'index.html') : join(dist, h);
    if (!existsSync(target)) { console.log('✗', f.replace(dist, '/'), '→', h); bad++; }
  }
  const alts = [...html.matchAll(/hreflang="(es-CR|en)" href="https?:\/\/[^/]+(\/[^"]*)"/g)].map((m) => m[2]);
  for (const a of alts) if (!existsSync(join(dist, a, 'index.html'))) { console.log('✗ hreflang', f.replace(dist, '/'), '→', a); bad++; }
}
console.log(`${files.length} páginas revisadas, ${bad} enlaces rotos.`);
process.exit(bad ? 1 : 0);
