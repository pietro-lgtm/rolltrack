/**
 * Configuración general del sitio.
 * ⚠️ Los valores marcados VERIFICAR deben confirmarse antes de publicar.
 */
export const SITE = {
  name: 'ReEnergy',
  plant: 'Orchidean One',
  // VERIFICAR: dominio definitivo. Se puede sobreescribir con la variable SITE_URL al compilar.
  url: (import.meta.env.SITE_URL as string | undefined) ?? 'https://reenergygroup.com',
  // VERIFICAR: correos y canales oficiales
  email: 'hola@reenergygroup.com',
  pressEmail: 'prensa@reenergygroup.com',
  govEmail: 'municipalidades@reenergygroup.com',
  whatsapp: '', // p. ej. '50688887777' — vacío = oculto
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
