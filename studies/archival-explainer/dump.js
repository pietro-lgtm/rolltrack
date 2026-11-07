// Render frames from renderer.html. Usage:
//   node dump.js contact                  -> one frame per beat into frames/contact_*.png + sheet
//   node dump.js times 1.5 3.2 ...        -> specific times
//   node dump.js all <fps> <outdir>       -> every frame of the 61s timeline
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

const BEAT_TIMES = [1.3, 3.9, 6.6, 9.9, 13.0, 16.2, 19.0, 21.5, 25.0, 28.2, 31.8, 35.2, 38.6, 42.4, 45.2, 49.6, 52.6, 55.4, 57.6, 60.2,
                    7.95, 14.75, 46.75]; // last three: mid-wipe checks

(async () => {
  const mode = process.argv[2] || 'contact';
  const browser = await chromium.launch({ args: ['--no-sandbox', '--force-color-profile=srgb', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 500, height: 800 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(DIR, 'renderer.html'));
  await page.waitForFunction('window.READY === true', null, { timeout: 30000 });

  async function frame(t) {
    await page.evaluate(tt => window.renderFrame(tt), t);
    return page.evaluate(() => document.getElementById('c').toDataURL('image/png'));
  }
  function save(d, f) { fs.writeFileSync(f, Buffer.from(d.split(',')[1], 'base64')); }

  if (mode === 'contact') {
    fs.mkdirSync(path.join(DIR, 'frames'), { recursive: true });
    for (const t of BEAT_TIMES) {
      save(await frame(t), path.join(DIR, 'frames', `contact_${t.toFixed(2).padStart(5,'0')}.png`));
      console.log('t=' + t);
    }
  } else if (mode === 'times') {
    fs.mkdirSync(path.join(DIR, 'frames'), { recursive: true });
    for (const t of process.argv.slice(3).map(Number)) {
      save(await frame(t), path.join(DIR, 'frames', `t_${t.toFixed(2).padStart(5,'0')}.png`));
      console.log('t=' + t);
    }
  } else if (mode === 'all') {
    const fps = Number(process.argv[3] || 30);
    const out = process.argv[4] || path.join(DIR, 'allframes');
    fs.mkdirSync(out, { recursive: true });
    const n = Math.round(61.0 * fps);
    for (let i = 0; i < n; i++) {
      await page.evaluate(tt => window.renderFrame(tt), i / fps);
      const d = await page.evaluate(() => document.getElementById('c').toDataURL('image/jpeg', 0.93));
      save(d, path.join(out, `f_${String(i).padStart(5, '0')}.jpg`));
      if (i % 150 === 0) console.log(`${i}/${n}`);
    }
    console.log('done', n, 'frames');
  }
  await browser.close();
})();
