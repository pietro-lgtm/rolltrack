// Genera las imágenes para compartir (Open Graph, 1200×630) de cada página y cada idioma.
// Es lo que se ve cuando alguien pega un enlace en WhatsApp, Facebook o X.
// Uso: node scripts/og-images.cjs   (requiere Playwright)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const pub = path.join(root, 'public');
const out = path.join(pub, 'og');
fs.mkdirSync(out, { recursive: true });

const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(root, 'node_modules/@fontsource', f)).toString('base64');
const poppins = font('poppins/files/poppins-latin-400-normal.woff2');
const poppins5 = font('poppins/files/poppins-latin-500-normal.woff2');
const gelasio = font('gelasio/files/gelasio-latin-400-normal.woff2');
const logo = (v) => fs.readFileSync(path.join(pub, 'brand', `reenergy-logo${v}.svg`), 'utf8');
const photo = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(pub, 'img/niebla-montana.jpg')).toString('base64');

const T = {
  lago: { bg: '#1b47b2', fg: '#f9f6e4', accent: '#d1f462', logo: '-azul' },
  red: { bg: '#e03b47', fg: '#fff8f0', accent: '#d1f462', logo: '-rojo' },
  green: { bg: '#a1c93e', fg: '#0d2459', accent: '#f9f6e4', logo: '-verde' },
  sky: { bg: '#f9f6e4', fg: '#3d3d3a', accent: '#56701a', logo: '' },
  photo: { bg: '#eceee9', fg: '#2f302c', accent: '#56701a', logo: '', photo: true },
};
const pages = {
  home: { t: 'photo', es: ['Orchidean One', 'Nadie tiene por qué sufrir el problema de la basura.'], en: ['Orchidean One', 'No one should have to suffer the trash problem.'] },
  minute: { t: 'green', es: ['En 1 minuto', 'La crisis de la basura y su solución, en un minuto.'], en: ['In 1 minute', 'The trash crisis and its solution, in one minute.'] },
  crisis: { t: 'red', es: ['La crisis', 'Costa Rica se está quedando sin lugar para su basura.'], en: ['The crisis', 'Costa Rica is running out of places to put its trash.'] },
  plant: { t: 'sky', es: ['La solución', 'Orchidean One: basura que se convierte en energía.'], en: ['The solution', 'Orchidean One: trash that becomes energy.'] },
  air: { t: 'lago', es: ['Aire y salud', '¿Contamina? La respuesta clara, con datos.'], en: ['Air & health', 'Does it pollute? The straight answer, with data.'] },
  world: { t: 'green', es: ['El mundo ya lo hace', 'Copenhague, Viena, Tokio: plantas en medio de la ciudad.'], en: ['The world does it', 'Copenhagen, Vienna, Tokyo: plants in the middle of the city.'] },
  build: { t: 'sky', es: ['Dónde y cuándo', 'El lugar correcto. El tiempo justo.'], en: ['Where and when', 'The right place. The right timeline.'] },
  faq: { t: 'sky', es: ['Preguntas', 'Pregunte sin pena. Respondemos claro.'], en: ['Questions', 'Ask anything. We answer plainly.'] },
  gov: { t: 'lago', es: ['Municipalidades', 'Una salida de largo plazo para la basura del cantón.'], en: ['Municipalities', 'A long-term answer for your canton’s trash.'] },
  monitor: { t: 'lago', es: ['Monitoreo público', 'No nos crea. Compruébelo.'], en: ['Public monitoring', 'Don’t trust us. Check.'] },
  press: { t: 'sky', es: ['Sala de prensa', 'Datos claros, fuentes a la vista.'], en: ['Press room', 'Clear data, visible sources.'] },
};

const html = (th, eyebrow, title) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(${poppins})}@font-face{font-family:P5;src:url(${poppins5})}@font-face{font-family:G;src:url(${gelasio})}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:${th.bg};color:${th.fg};font-family:P;position:relative;overflow:hidden}
.ph{position:absolute;inset:0;background:url(${photo}) 30% 70%/cover}
.ph:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(245,245,240,.88),rgba(245,245,240,.35) 70%,rgba(245,245,240,0))}
.ring{position:absolute;right:-120px;bottom:-160px;width:560px;height:560px;border-radius:50%;background:${th.accent};opacity:.16}
.in{position:absolute;inset:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
.logo svg{height:58px;width:auto}
.e{font-family:P5;font-size:26px;letter-spacing:.08em;text-transform:uppercase;color:${th.accent};margin:0 0 18px;display:flex;align-items:center;gap:14px}
.e:before{content:'';width:16px;height:16px;border-radius:50%;background:currentColor}
h1{font-weight:400;font-size:70px;line-height:1.06;letter-spacing:-.02em;margin:0;max-width:920px}
.u{font-family:G;font-size:24px;opacity:.8}
</style></head><body>${th.photo ? '<div class="ph"></div>' : '<div class="ring"></div>'}<div class="in"><div class="logo">${logo(th.logo)}</div><div><p class="e">${eyebrow}</p><h1>${title}</h1></div><div class="u">reenergygroup.com · Orchidean One</div></div></body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [key, v] of Object.entries(pages)) {
    for (const lang of ['es', 'en']) {
      const [e, t] = v[lang];
      await p.setContent(html(T[v.t], e, t), { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready);
      await p.screenshot({ path: path.join(out, `${key}-${lang}.png`) });
      console.log('✓', `og/${key}-${lang}.png`);
    }
  }
  await b.close();
})();
