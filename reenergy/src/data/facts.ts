/**
 * Cifras públicas y sus fuentes.
 *
 * REGLA DE ORO: ninguna cifra sale al público sin fuente. Si un periodista, un diputado o un
 * vecino revisa un dato y lo encuentra mal, perdemos la conversación entera.
 *
 * - SOURCES: datos de terceros (prensa, Ministerio de Salud, OCDE, UE, EPA…). Revisar cada enlace
 *   antes de publicar (ver README › Verificación).
 * - PROJECT: cifras de diseño de Orchidean One. ⚠️ TODAS deben confirmarse con ingeniería.
 */

export const SOURCES = {
  gen4000: {
    label: 'Teletica (2026). “Entre camiones, olores y basura: la otra cara del manejo de residuos en Costa Rica”.',
    url: 'https://www.teletica.com/nacional/entre-camiones-olores-y-basura-la-otra-cara-del-manejo-de-residuos-en-costa-rica_406892',
  },
  ocde80: {
    label: 'Delfino (marzo 2025). “OCDE: Costa Rica depende en exceso de los rellenos sanitarios”.',
    url: 'https://delfino.cr/2025/03/ocde-costa-rica-depende-en-exceso-de-los-rellenos-sanitarios',
  },
  recycling: {
    label: 'Teletica (2025). “Salud busca elevar el reciclaje en Costa Rica: solo 4% de residuos se reutiliza”.',
    url: 'https://www.teletica.com/nacional/salud-busca-elevar-el-reciclaje-en-costa-rica-solo-4-de-residuos-se-reutiliza_404249',
  },
  limon300: {
    label: 'La Nación. Ministra de Salud: parte de la basura de la GAM viaja más de 300 km hasta Limón.',
    url: 'https://www.nacion.com/el-pais/mary-munive-ministra-de-salud-estima-que-la-gam-se/KQQRGQ67ABFL3O4K7EJO7YL2GM/story/',
  },
  huazo: {
    label: 'Semanario Universidad (2026). “Ministra advierte sobre vida útil de relleno de El Huazo”.',
    url: 'https://semanariouniversidad.com/pais/ministra-advierte-sobre-vida-util-de-relleno-de-el-huazo-queda-una-celda-y-ya-esta-completamente-llena/',
  },
  huazoLife: {
    label: 'Semanario Universidad. “Vida útil de relleno de El Huazo se reduce por cierre de Los Pinos y cierre técnico de La Carpio”.',
    url: 'https://semanariouniversidad.com/pais/vida-util-de-relleno-de-el-huazo-se-reduce-de-11-a-dos-anos-por-cierre-de-los-pinos-y-cierre-tecnico-de-la-carpio/',
  },
  colapsoGam: {
    label: 'Delfino (octubre 2024). “Ministerio de Salud reporta rellenos sanitarios de la GAM al borde del colapso”.',
    url: 'https://delfino.cr/2024/10/ministerio-de-salud-reporta-rellenos-sanitarios-de-la-gran-area-metropolitana-al-borde-del-colapso',
  },
  carpio: {
    label: 'Semanario Universidad. “Ministerio de Salud: relleno sanitario de La Carpio ya entró en cierre técnico”.',
    url: 'https://semanariouniversidad.com/pais/ministerio-de-salud-relleno-sanitario-de-la-carpio-ya-entro-en-cierre-tecnico/',
  },
  losPinos: {
    label: 'Semanario Universidad. “Relleno sanitario de El Huazo recibe más basura de la GAM tras cierre de Los Pinos”.',
    url: 'https://semanariouniversidad.com/pais/relleno-sanitario-de-el-huazo-recibe-mas-basura-de-la-gam-tras-cierre-de-los-pinos/',
  },
  santaAna: {
    label: 'Delfino (enero 2026). “Municipalidad de Santa Ana aumenta tarifa de recolección de basura en un 45%”.',
    url: 'https://delfino.cr/2026/01/municipalidad-de-santa-ana-aumenta-tarifa-de-recoleccion-de-basura-en-un-45',
  },
  desamparados: {
    label: 'Semanario Universidad. “Municipalidad de Desamparados aumenta en 19% tarifa de recolección de basura”.',
    url: 'https://semanariouniversidad.com/pais/municipalidad-de-desamparados-aumenta-en-19-tarifa-de-recoleccion-de-basura-mientras-busca-relleno-para-residuos-de-250-000-personas/',
  },
  ghg: {
    label: 'PNUD Costa Rica. Inventario Nacional de Gases de Efecto Invernadero (2017, publicado 2022): residuos = 14,8% de las emisiones.',
    url: 'https://www.undp.org/es/costa-rica/comunicados-de-prensa/transporte-genera-el-42-de-las-emisiones-de-gases-de-efecto-invernadero-en-costa-rica',
  },
  ley8839: {
    label: 'Ley 8839, Ley para la Gestión Integral de Residuos (2010), artículo 4: jerarquía de gestión.',
    url: 'https://www.ucr.ac.cr/medios/documentos/2015/LEY-8839.pdf',
  },
  dec39136: {
    label: 'Decreto 39136-S-MINAE (2015). Reglamento sobre condiciones de operación y control de emisiones para coincineración de residuos sólidos ordinarios.',
    url: 'https://leap.unep.org/en/countries/cr/national-legislation/decreto-no-39136sminae-reglamento-sobre-condiciones-de-operacion',
  },
  setena: {
    label: 'Decreto 31849-MINAE-S-MOPT-MAG-MEIC. Reglamento General sobre los Procedimientos de Evaluación de Impacto Ambiental (SETENA).',
    url: 'https://faolex.fao.org/docs/pdf/cos106699.pdf',
  },
  ice2024: {
    label: 'Semanario Universidad. Contraloría sobre decisiones del ICE, racionamientos de 2024 y gasto en generación térmica e importaciones.',
    url: 'https://semanariouniversidad.com/pais/contraloria-expone-como-el-ice-tomo-decisiones-no-tecnicas-que-pusieron-al-pais-al-borde-de-racionamientos-y-le-generaron-gastos-millonarios/',
  },
  renov2024: {
    label: 'Delfino (febrero 2025). “Generación eléctrica renovable cayó en 2024 por debajo del 90% por primera vez en 10 años”.',
    url: 'https://delfino.cr/2025/02/generacion-electrica-renovable-cayo-en-2024-por-debajo-del-90-por-primera-vez-en-10-anos',
  },
  ecoprog: {
    label: 'Renewable Energy Magazine (2026), con datos de ecoprog: más de 3.100 plantas de valorización energética en el mundo (fin de 2025).',
    url: 'https://www.renewableenergymagazine.com/biomass/wastetoenergy-global-growth-market-downturn-in-china-20260305',
  },
  cewep: {
    label: 'CEWEP. Mapa de plantas de valorización energética en Europa, 2023 (499 plantas).',
    url: 'https://www.cewep.eu/wp-content/uploads/2026/02/EU-Map-2023.pdf',
  },
  japan: {
    label: 'Nippon.com. Instalaciones de incineración en Japón (Ministerio del Ambiente).',
    url: 'https://www.nippon.com/en/japan-data/h02758/',
  },
  tokyo: {
    label: 'Let’s Recycle. “Tokyo’s waste management system” (21 plantas en los 23 distritos).',
    url: 'https://www.letsrecycle.com/news/tokyos-waste-management-system/',
  },
  copenhill: {
    label: 'Amager Resource Center (CopenHill), presentación ante el CESE de la UE, 2025.',
    url: 'https://www.eesc.europa.eu/sites/default/files/2025-07/8._nils_thor_rosted_amager_resource_center_0.pdf',
  },
  spittelau: {
    label: 'Wien Energie. Planta de Spittelau.',
    url: 'https://www.wienenergie.at/spittelau-waste-incineration-plant/',
  },
  singapore: {
    label: 'National Environment Agency (NEA) de Singapur. Infraestructura de manejo de residuos sólidos.',
    url: 'https://www.nea.gov.sg/our-services/waste-management/waste-management-infrastructure/solid-waste-management-infrastructure',
  },
  sweden: {
    label: 'Nordic Investment Bank. “Sweden: waste too valuable to throw away”.',
    url: 'https://www.nib.int/articles/sweden-waste-too-valuable-to-throw-away',
  },
  swiss: {
    label: 'Oficina Federal del Ambiente de Suiza (BAFU). Plantas de incineración de residuos municipales.',
    url: 'https://www.bafu.admin.ch/en/municipal-waste-incineration-plants-mwi',
  },
  germany: {
    label: 'CEWEP. Tratamiento de residuos municipales en Europa, 2023 (Alemania: 69% reciclado o compostado).',
    url: 'https://www.cewep.eu/municipal-waste-treatment-2023/',
  },
  bottomAsh: {
    label: 'CEWEP. Hoja informativa sobre reutilización de cenizas de fondo.',
    url: 'https://www.cewep.eu/wp-content/uploads/2017/09/FINAL-Bottom-Ash-factsheet.pdf',
  },
  barueri: {
    label: 'Gobierno del Estado de São Paulo (SEMIL), octubre 2026. URE Barueri llega a 88% de avance.',
    url: 'https://semil.sp.gov.br/2026/10/ure-barueri-chega-a-88-de-avanco-nas-obras-e-preve-transformar-residuos-em-energia/',
  },
  ied: {
    label: 'Directiva 2010/75/UE sobre emisiones industriales, Anexo VI, parte 3 (límites para incineración de residuos).',
    url: 'https://legislation.gov.uk/eudr/2010/75/annex/VI/part/3',
  },
  bat2019: {
    label: 'Decisión de Ejecución (UE) 2019/2010: conclusiones sobre mejores técnicas disponibles (MTD) para incineración de residuos.',
    url: 'https://eur-lex.europa.eu/eli/dec_impl/2019/2010/oj',
  },
  epaDioxin: {
    label: 'US EPA. Emisiones al aire de combustores de residuos municipales (dioxinas: −99% entre 1990 y 2005).',
    url: 'https://archive.epa.gov/epawaste/nonhaz/municipal/web/html/airem.html',
  },
  bmu2005: {
    label: 'Ministerio Federal de Ambiente de Alemania (BMU, 2005). “Abschied von der Dioxinschleuder”.',
    url: 'https://www.itad.de/wissen/studien/2005_abschied_von_der_dioxinschleuder.pdf',
  },
  ipccMethane: {
    label: 'IPCC AR6, GT I, cuadro 7.15: potencial de calentamiento del metano.',
    url: 'https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/',
  },
  kaplan: {
    label: 'Kaplan, Decarolis y Thorneloe (2009). “Is it better to burn or bury waste for clean electricity generation?” Environmental Science & Technology.',
    url: 'https://doi.org/10.1021/es802395e',
  },
  iswa: {
    label: 'ISWA (2024). Guía de valorización energética para países de ingresos bajos y medios.',
    url: 'https://wtert.org/wp-content/uploads/2024/01/ISWA-Guidelines-Waste-to-Energy-in-Low-Middle-Income-Countries.pdf',
  },
} as const;

export type SourceKey = keyof typeof SOURCES;

/** Construye la lista numerada de fuentes de una página, en el orden dado. */
export function sourceList(keys: SourceKey[]) {
  return keys.map((k, i) => ({ id: String(i + 1), key: k, ...SOURCES[k] }));
}
/** Número de referencia de una fuente dentro de la lista de una página. */
export function refNo(keys: SourceKey[], k: SourceKey) {
  return keys.indexOf(k) + 1;
}

/**
 * CIFRAS DEL PROYECTO — confirmadas por ReEnergy (noviembre 2026) salvo donde dice VERIFICAR.
 * Se muestran en el sitio como "estimación" cuando todavía dependen de ingeniería de detalle.
 */
export const PROJECT = {
  capacityTpd: 1000, // t/día — confirmado
  powerMW: 20, // MW netos — confirmado
  // VERIFICAR: cálculo propio, no confirmado por ReEnergy.
  // 20 MW × ~8.000 h/año ≈ 160 GWh/año ÷ ~3.000 kWh por hogar al año (≈250 kWh/mes) ≈ 53.000 → "unos 50.000".
  homes: 50000,
  areaHa: 10, // hectáreas, como mínimo — confirmado
  constructionEs: '18 a 22 meses', // 1,5 a 1,8 años tras permisos — confirmado
  constructionEn: '18–22 months',
  constructionShort: '18–22',
  permitsMonths: 6, // meta del programa para estudios y permisos — confirmado (es una meta)
  jobsOperation: 150, // empleos permanentes — confirmado ("como 150"); empleos de obra: sin dato
  volumeReduction: 90, // % reducción de volumen (rango típico 80–90%)
  furnaceC: 850, // °C mínimo, 2 s (Directiva 2010/75/UE)
  furnaceMaxC: 1100, // °C máximo de operación de la parrilla — confirmado
  firstSite: 'Cartago', // primera planta — confirmado
  secondSite: 'Alajuela', // segunda planta — confirmado
  wasteStudy: { es: 'la Universidad de Costa Rica (UCR)', en: 'the University of Costa Rica (UCR)' }, // en curso — confirmado
  // Municipalidades con carta de interés firmada (no vinculante) — confirmado. "San Pedro" = Municipalidad de Montes de Oca.
  lettersOfInterest: ['Santa Ana', 'Curridabat', 'Alajuelita', 'Desamparados', 'Montes de Oca (San Pedro)', 'La Unión'],
};

/** Límites diarios de emisión de la UE para incineración (Directiva 2010/75/UE, Anexo VI). */
export const EU_LIMITS = [
  { k: 'dust', es: 'Partículas (polvo)', en: 'Particulate matter (dust)', v: '10', u: 'mg/Nm³' },
  { k: 'nox', es: 'Óxidos de nitrógeno (NOx)', en: 'Nitrogen oxides (NOx)', v: '200', u: 'mg/Nm³' },
  { k: 'so2', es: 'Dióxido de azufre (SO₂)', en: 'Sulfur dioxide (SO₂)', v: '50', u: 'mg/Nm³' },
  { k: 'hcl', es: 'Ácido clorhídrico (HCl)', en: 'Hydrogen chloride (HCl)', v: '10', u: 'mg/Nm³' },
  { k: 'hf', es: 'Ácido fluorhídrico (HF)', en: 'Hydrogen fluoride (HF)', v: '1', u: 'mg/Nm³' },
  { k: 'co', es: 'Monóxido de carbono (CO)', en: 'Carbon monoxide (CO)', v: '50', u: 'mg/Nm³' },
  { k: 'toc', es: 'Carbono orgánico total', en: 'Total organic carbon', v: '10', u: 'mg/Nm³' },
  { k: 'hg', es: 'Mercurio (Hg)', en: 'Mercury (Hg)', v: '0,05', u: 'mg/Nm³' },
  { k: 'dioxin', es: 'Dioxinas y furanos', en: 'Dioxins and furans', v: '0,1', u: 'ng TEQ/Nm³' },
];
