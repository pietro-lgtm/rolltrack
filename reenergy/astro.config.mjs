// @ts-check
import { defineConfig } from 'astro/config';

// VERIFICAR: dominio definitivo (también se puede pasar SITE_URL al compilar)
const site = process.env.SITE_URL || 'https://reenergygroup.com';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
