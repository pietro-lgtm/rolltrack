/**
 * Configuración general del sitio.
 * ⚠️ Los valores marcados VERIFICAR deben confirmarse antes de publicar.
 */
export const SITE = {
  name: 'ReEnergy',
  plant: 'Orchidean One',
  // VERIFICAR: dominio definitivo. Se puede sobreescribir con la variable SITE_URL al compilar.
  url: (import.meta.env.SITE_URL as string | undefined) ?? 'https://reenergygroup.com',
  // Correo de contacto (recibe también los formularios por correo)
  email: 'reenergygroupcr@gmail.com',
  pressEmail: 'reenergygroupcr@gmail.com',
  govEmail: 'reenergygroupcr@gmail.com',
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    x: '',
  },
  // Endpoint para formularios (Formspree, Getform, backend propio…). Vacío = respaldo por correo.
  formEndpoint: (import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined) ?? '',
  // Video principal de campaña (MP4/WebM en /public/media o URL externa). Vacío = foto con movimiento.
  heroVideo: (import.meta.env.PUBLIC_HERO_VIDEO as string | undefined) ?? '',
  themeColor: '#1b47b2',
  /**
   * ¿Visible en Google? false = el sitio está en línea pero con "noindex" (no aparece en buscadores).
   * Cambiar con la variable PUBLIC_INDEXABLE=true en Vercel cuando las cifras estén aprobadas.
   */
  indexable: (import.meta.env.PUBLIC_INDEXABLE as string | undefined) === 'true',
};
