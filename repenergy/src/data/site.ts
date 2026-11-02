/**
 * Configuración general del sitio.
 * ⚠️ Los valores marcados VERIFICAR deben confirmarse antes de publicar.
 */
export const SITE = {
  name: 'Repenergy',
  plant: 'Orchidean One',
  // VERIFICAR: dominio definitivo. Se puede sobreescribir con la variable SITE_URL al compilar.
  url: (import.meta.env.SITE_URL as string | undefined) ?? 'https://repenergy.cr',
  // VERIFICAR: correos y canales oficiales
  email: 'hola@repenergy.cr',
  pressEmail: 'prensa@repenergy.cr',
  govEmail: 'municipalidades@repenergy.cr',
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
};
