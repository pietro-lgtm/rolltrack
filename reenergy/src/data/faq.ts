/**
 * Preguntas frecuentes. Tono: claro, corto, sin evasivas. En un tema político, una respuesta
 * honesta convence más que una promesa: no prometemos “cero emisiones” ni “luz más barata”.
 * `home: true` = aparece en la portada.
 * ⚠️ Las respuestas marcadas [VERIFICAR] en comentarios dependen de decisiones del proyecto.
 */
import { ROUTES } from '../lib/i18n';
import { PROJECT } from './facts';

interface Item {
  q: string;
  a: string;
  home?: boolean;
}

export const FAQ: { es: Item[]; en: Item[] } = {
  es: [
    {
      home: true,
      q: '¿La planta contamina?',
      a: `<p>Toda industria tiene emisiones, y no le vamos a decir lo contrario. Lo importante es <strong>cuánto, comparado con qué y quién lo controla</strong>.</p>
<p>Hoy la basura ya contamina: los rellenos sueltan metano y lixiviados, y en muchos patios se quema basura sin ningún control. Orchidean One trata sus gases en varias etapas antes de que salgan, se diseña para cumplir los límites de la Unión Europea —de los más estrictos del mundo— y publica sus mediciones. <a href="${ROUTES.air.es}">Vea la respuesta completa</a>.</p>`,
    },
    {
      home: true,
      q: '¿Va a oler mal?',
      a: `<p>No. La basura llega en camiones cerrados y se descarga dentro de un edificio sellado. El aire de adentro se aspira y se usa en el horno: los olores no salen, se queman. Es la razón por la que plantas como estas funcionan en medio de Viena, Copenhague o Tokio.</p>`,
    },
    {
      q: '¿Es peligrosa para la salud de los vecinos?',
      a: `<p>Las plantas modernas cambiaron radicalmente. En Estados Unidos, las dioxinas emitidas por estas plantas bajaron más de un 99% entre 1990 y 2005 gracias a los filtros modernos. En Alemania, las chimeneas y estufas de leña de las casas emiten unas 20 veces más dioxinas que todas sus plantas juntas.</p>
<p>Orchidean One se diseña con esa tecnología de limpieza, con medición continua y con los datos a la vista. Si un valor se sale del límite, se sabe.</p>`,
    },
    {
      home: true,
      q: '¿Esto acaba con el reciclaje?',
      a: `<p>No. Primero se recicla y se composta; a la planta llega lo que ya no tiene otro uso y que hoy se entierra. Así lo ordena la Ley 8839: evitar, reducir, reutilizar, valorizar… y enterrar solo como último recurso.</p>
<p>Los países que más reciclan también usan estas plantas: Alemania recicla o composta el 69% de su basura municipal y convierte gran parte del resto en energía.</p>`,
    },
    {
      home: true,
      q: '¿Dónde se va a construir?',
      a: `<p>La primera planta, Orchidean One, será en <strong>${PROJECT.firstSite}</strong>; la segunda, en <strong>${PROJECT.secondSite}</strong>. El terreno exacto se define con estudios técnicos y consulta pública: <strong>zona industrial o compatible</strong> según el plan regulador, lejos de casas, fuera de áreas protegidas y de zonas de recarga de acuíferos, cerca de carreteras principales y de una subestación eléctrica. <a href="${ROUTES.build.es}">Vea los criterios y los plazos</a>.</p>`,
    },
    {
      q: '¿Cuánto tarda en construirse?',
      a: `<p>El programa tiene como meta completar estudios y permisos en unos ${PROJECT.permitsMonths} meses. Después, la construcción toma entre ${PROJECT.constructionEs}. Es rápido porque el diseño ya está probado en cientos de plantas: la obra civil y la fabricación de equipos avanzan al mismo tiempo.</p>`,
    },
    {
      q: '¿Es legal en Costa Rica?',
      a: `<p>Sí. La Ley 8839 de Gestión Integral de Residuos incluye el aprovechamiento energético dentro de la valorización de residuos, y desde 2015 el Decreto 39136-S-MINAE regula las condiciones de operación y los límites de emisión de este tipo de instalaciones. Como todo proyecto grande, necesita viabilidad ambiental de SETENA y permisos municipales.</p>`,
    },
    {
      q: '¿Habrá consulta pública?',
      a: `<p>Sí. El Estudio de Impacto Ambiental que revisa SETENA incluye participación ciudadana, y ReEnergy hará además sesiones abiertas en las comunidades. El proyecto ya se presentó a municipalidades y al Ministerio de Salud. Suscríbase en la página de inicio y le avisamos las fechas.</p>`,
    },
    {
      q: 'La basura tica es muy húmeda. ¿Sirve para esto?',
      a: `<p>Es una buena pregunta. Nuestra basura tiene mucha materia orgánica y humedad. Por eso ${PROJECT.wasteStudy.es} está estudiando la basura real del país —humedad y poder calorífico— para ajustar el diseño. La basura reposa en una fosa cerrada para escurrir, y una parrilla móvil de varias etapas la mueve y mezcla para que se queme por completo, entre 850 y 1.100 °C.</p>`,
    },
    {
      q: '¿Qué pasa con la ceniza?',
      a: `<p>La basura se reduce a cerca de una décima parte de su volumen. Los metales se recuperan para reciclar, y la ceniza se mezcla con cemento para fabricar adoquines para calles, urbanizaciones y parqueos (Dinamarca reutiliza casi toda su ceniza de fondo en obras). La ceniza fina de los filtros —una porción pequeña— se estabiliza con cemento, bajo el control del Ministerio de Salud.</p>`,
    },
    {
      q: '¿Va a bajar el recibo de la luz?',
      a: `<p>No le vamos a prometer eso: las tarifas las fija ARESEP. Lo que sí aporta Orchidean One es <strong>energía firme</strong>, que se produce todos los días, llueva o no. En 2024 hubo racionamientos y el país gastó cientos de millones de dólares en combustibles e importaciones de electricidad. Cada megavatio que no depende de la lluvia ayuda.</p>`,
    },
    {
      q: '¿Quién paga la planta?',
      // [VERIFICAR] modelo de inversión y tarifa
      a: `<p>Toda la inversión es privada, de ReEnergy: <strong>el Estado no pone ni un colón</strong>. Las municipalidades pagarían una tarifa por tonelada <strong>igual o menor</strong> a la que hoy pagan por llevar su basura a Guápiles o a Puntarenas, con un precio estable y un destino seguro para la basura del cantón.</p>`,
    },
    {
      q: '¿Cómo sé que van a cumplir?',
      a: `<p>Porque no tendrá que creernos: las emisiones se miden de forma continua y se publican en la página de <a href="${ROUTES.monitor.es}">monitoreo</a> y en pantallas públicas frente a la planta y en las municipalidades. Además, el Ministerio de Salud fiscaliza y las auditorías independientes periódicas son obligatorias, con resultados públicos.</p>`,
    },
    {
      q: '¿Por qué no simplemente abrir más rellenos?',
      a: `<p>Porque cada relleno nuevo necesita un terreno enorme que ningún vecindario quiere, y se llena en pocos años. Los rellenos del Valle Central ya están en el límite y parte de la basura viaja más de 300 km hasta Limón. Enterrar es la opción más cara a largo plazo: se pierde la tierra, se emite metano y la basura se queda ahí para siempre.</p>`,
    },
    {
      q: '¿Qué empleos genera?',
      a: `<p>Unos ${PROJECT.jobsOperation} empleos técnicos permanentes, además del empleo durante la construcción, con prioridad para personas de la zona y programas de formación técnica.</p>`,
    },
    {
      q: '¿Qué municipalidades están interesadas?',
      a: `<p>Ya firmaron cartas de interés (no vinculantes): ${PROJECT.lettersOfInterest.join(', ')} y otras. Si usted representa a una municipalidad, <a href="${ROUTES.gov.es}">solicite una reunión técnica</a>.</p>`,
    },
  ],
  en: [
    {
      home: true,
      q: 'Does the plant pollute?',
      a: `<p>Every industry has emissions, and we won’t pretend otherwise. What matters is <strong>how much, compared to what, and who controls it</strong>.</p>
<p>Today, trash already pollutes: landfills release methane and leachate, and in many backyards trash is burned with no control at all. Orchidean One treats its gases in several stages before release, is designed to meet European Union limits — among the strictest in the world — and publishes its readings. <a href="${ROUTES.air.en}">See the full answer</a>.</p>`,
    },
    {
      home: true,
      q: 'Will it smell?',
      a: `<p>No. Trash arrives in closed trucks and is unloaded inside a sealed building. The air inside is drawn into the furnace: odors don’t escape, they get burned. That’s why plants like these operate in the middle of Vienna, Copenhagen and Tokyo.</p>`,
    },
    {
      q: 'Is it dangerous for neighbors’ health?',
      a: `<p>Modern plants changed radically. In the United States, dioxin emissions from these plants fell more than 99% between 1990 and 2005 thanks to modern filters. In Germany, household fireplaces and wood stoves emit about 20 times more dioxin than all its plants combined.</p>
<p>Orchidean One is designed with that cleaning technology, with continuous measurement and the data in plain sight. If a value goes over the limit, people will know.</p>`,
    },
    {
      home: true,
      q: 'Does this kill recycling?',
      a: `<p>No. Recycling and composting come first; the plant takes what has no other use and is buried today. That’s exactly what Costa Rica’s Law 8839 sets out: avoid, reduce, reuse, recover… and bury only as a last resort.</p>
<p>The countries that recycle most also use these plants: Germany recycles or composts 69% of its municipal waste and turns much of the rest into energy.</p>`,
    },
    {
      home: true,
      q: 'Where will it be built?',
      a: `<p>The first plant, Orchidean One, will be in <strong>${PROJECT.firstSite}</strong>; the second, in <strong>${PROJECT.secondSite}</strong>. The exact site is chosen through technical studies and public consultation: an <strong>industrial or compatible zone</strong> under the local zoning plan, away from homes, outside protected areas and aquifer recharge zones, close to main highways and an electrical substation. <a href="${ROUTES.build.en}">See the criteria and timeline</a>.</p>`,
    },
    {
      q: 'How long does it take to build?',
      a: `<p>The program targets completing studies and permits in about ${PROJECT.permitsMonths} months. After that, construction takes ${PROJECT.constructionEn}. It’s fast because the design is already proven in hundreds of plants: civil works and equipment manufacturing move forward at the same time.</p>`,
    },
    {
      q: 'Is it legal in Costa Rica?',
      a: `<p>Yes. Law 8839 on Integrated Waste Management includes energy recovery as a form of waste valorization, and since 2015 Decree 39136-S-MINAE has regulated operating conditions and emission limits for this kind of facility. Like any large project, it needs environmental approval from SETENA and municipal permits.</p>`,
    },
    {
      q: 'Will there be public consultation?',
      a: `<p>Yes. The Environmental Impact Study reviewed by SETENA includes public participation, and ReEnergy will also hold open sessions in the communities. The project has already been presented to municipalities and the Ministry of Health. Sign up on the home page and we’ll let you know the dates.</p>`,
    },
    {
      q: 'Costa Rican trash is very wet. Does it work?',
      a: `<p>Good question. Our trash has a lot of organic matter and moisture. That’s why ${PROJECT.wasteStudy.en} is studying the country’s actual waste — moisture and heating value — to fine-tune the design. Trash rests in a sealed pit to drain, and a moving multi-stage grate keeps it moving and mixing so it burns completely, between 850 and 1,100 °C.</p>`,
    },
    {
      q: 'What happens to the ash?',
      a: `<p>Trash shrinks to about a tenth of its volume. Metals are recovered for recycling, and the ash is mixed with cement to make paving blocks for streets, housing developments and parking lots (Denmark reuses nearly all of its bottom ash in construction). The fine ash from the filters — a small share — is stabilized with cement, under Ministry of Health oversight.</p>`,
    },
    {
      q: 'Will my electricity bill go down?',
      a: `<p>We won’t promise that: rates are set by the regulator, ARESEP. What Orchidean One does provide is <strong>firm power</strong>, produced every day, rain or shine. In 2024 there were blackouts and the country spent hundreds of millions of dollars on fuel and electricity imports. Every megawatt that doesn’t depend on rain helps.</p>`,
    },
    {
      q: 'Who pays for the plant?',
      a: `<p>The entire investment is private, by ReEnergy: <strong>not one colón of public money</strong>. Municipalities would pay a per-tonne fee <strong>equal to or below</strong> what they pay today to haul their trash to Guápiles or Puntarenas, with a stable price and a secure destination for their trash.</p>`,
    },
    {
      q: 'How do I know you’ll comply?',
      a: `<p>You won’t have to take our word for it: emissions are measured continuously and published on the <a href="${ROUTES.monitor.en}">monitoring</a> page and on public screens outside the plant and at the municipalities. The Ministry of Health oversees the plant, and regular independent audits are mandatory, with public results.</p>`,
    },
    {
      q: 'Why not just open more landfills?',
      a: `<p>Because every new landfill needs a huge piece of land no neighborhood wants, and it fills up in a few years. The Central Valley’s landfills are already at their limit and some trash travels over 300 km to Limón. Burying is the most expensive option in the long run: the land is lost, methane is released and the trash stays there forever.</p>`,
    },
    {
      q: 'What jobs does it create?',
      a: `<p>About ${PROJECT.jobsOperation} permanent technical jobs, plus employment during construction, with priority for local people and technical training programs.</p>`,
    },
    {
      q: 'Which municipalities are interested?',
      a: `<p>These have signed (non-binding) letters of interest: ${PROJECT.lettersOfInterest.join(', ')} and others. If you represent a municipality, <a href="${ROUTES.gov.en}">request a technical meeting</a>.</p>`,
    },
  ],
};
