const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
(async () => {
  const mode = process.argv[2] || 'frames';
  const browser = await chromium.launch({ args: ['--no-sandbox','--force-color-profile=srgb','--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 600, height: 600 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto('file://' + path.join(DIR, 'renderer3.html'));
  await page.waitForFunction('window.READY === true', null, { timeout: 15000 });
  async function frame(t, type='png', q) {
    await page.evaluate(tt => window.renderFrame(tt), t);
    return page.evaluate(([ty,qq]) => document.getElementById('c').toDataURL(ty,qq), [type==='jpg'?'image/jpeg':'image/png', q||0.93]);
  }
  const save=(d,f)=>fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));
  if (mode === 'frames') {
    fs.mkdirSync(path.join(DIR,'check'),{recursive:true});
    for (const fnum of process.argv.slice(3).map(Number)) {
      save(await frame(fnum/24), path.join(DIR,'check',`v_${String(fnum).padStart(4,'0')}.png`));
    }
    console.log('done');
  } else if (mode === 'all') {
    const out = path.join(DIR,'frames'); fs.mkdirSync(out,{recursive:true});
    for (let i=0;i<720;i++){
      save(await frame(i/24,'jpg'), path.join(out,`f_${String(i).padStart(4,'0')}.jpg`));
      if(i%120===0)console.log(i);
    }
    console.log('done all');
  }
  await browser.close();
})();
