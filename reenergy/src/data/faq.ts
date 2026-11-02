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
      a: `<p>El sitio se define con estudios técnicos y consulta pública. Los criterios: <strong>zona industrial o compatible</strong> según el plan regulador, lejos de casas, fuera de áreas protegidas y de zonas de recarga de acuíferos, cerca de carreteras principales y de una subestación eléctrica. <a href="${ROUTES.build.es}">Vea los criterios y los plazos</a>.</p>`,
    },
    {
      q: '¿Cuánto tarda en construirse?',
      a: `<p>Una vez aprobados los permisos, la construcción toma alrededor de ${PROJECT.constructionMonths} meses (estimación de diseño). Es rápido porque el diseño ya está probado en cientos de plantas: la obra civil y la fabricación de equipos avanzan al mismo tiempo.</p>`,
    },
    {
      q: '¿Es legal en Costa Rica?',
      a: `<p>Sí. La Ley 8839 de Gestión Integral de Residuos incluye el aprovechamiento energético dentro de la valorización de residuos, y desde 2015 el Decreto 39136-S-MINAE regula las condiciones de operación y los límites de emisión de este tipo de instalaciones. Como todo proyecto grande, necesita viabilidad ambiental de SETENA y permisos municipales.</p>`,
    },
    {
      q: '¿Habrá consulta pública?',
      a: `<p>Sí. El Estudio de Impacto Ambiental que revisa SETENA incluye participación ciudadana, y Reenergy hará además sesiones abiertas en las comunidades. Suscríbase en la página de inicio y le avisamos las fechas.</p>`,
    },
    {
      q: 'La basura tica es muy húmeda. ¿Sirve para esto?',
      a: `<p>Es una buena pregunta. Nuestra basura tiene mucha materia orgánica y humedad. Por eso la planta se diseña para ese tipo de residuo: la basura reposa en una fosa cerrada para escurrir antes de entrar al horno, y se usan parrillas pensadas para basura húmeda. La organización internacional ISWA fija un poder calorífico mínimo; el diseño se valida con estudios de la basura real de Costa Rica.</p>`,
    },
    {
      q: '¿Qué pasa con la ceniza?',
      a: `<p>La basura se reduce a cerca de una décima parte de su volumen. La mayor parte de lo que queda es ceniza de fondo, que se puede usar como material de construcción (Dinamarca reutiliza casi toda la suya). Los metales se recuperan para reciclar. La ceniza fina de los filtros —una porción pequeña— se estabiliza y se dispone en un sitio autorizado para residuos peligrosos.</p>`,
    },
    {
      q: '¿Va a bajar el recibo de la luz?',
      a: `<p>No le vamos a prometer eso: las tarifas las fija ARESEP. Lo que sí aporta Orchidean One es <strong>energía firme</strong>, que se produce todos los días, llueva o no. En 2024 hubo racionamientos y el país gastó cientos de millones de dólares en combustibles e importaciones de electricidad. Cada megavatio que no depende de la lluvia ayuda.</p>`,
    },
    {
      q: '¿Quién paga la planta?',
      // [VERIFICAR] modelo de inversión y tarifa
      a: `<p>La inversión la hace Reenergy. Las municipalidades pagarían una tarifa por tonelada entregada —como hoy le pagan al relleno— con la ventaja de un precio estable y un destino seguro para la basura del cantón.</p>`,
    },
    {
      q: '¿Cómo sé que van a cumplir?',
      a: `<p>Porque no tendrá que creernos: las emisiones se miden de forma continua y se publican en la página de <a href="${ROUTES.monitor.es}">monitoreo</a>. Además, el Ministerio de Salud fiscaliza y se harán auditorías independientes periódicas.</p>`,
    },
    {
      q: '¿Por qué no simplemente abrir más rellenos?',
      a: `<p>Porque cada relleno nuevo necesita un terreno enorme que ningún vecindario quiere, y se llena en pocos años. Los rellenos del Valle Central ya están en el límite y parte de la basura viaja más de 300 km hasta Limón. Enterrar es la opción más cara a largo plazo: se pierde la tierra, se emite metano y la basura se queda ahí para siempre.</p>`,
    },
    {
      q: '¿Qué empleos genera?',
      a: `<p>Cerca de ${PROJECT.jobsConstruction} empleos en el pico de la construcción y unos ${PROJECT.jobsOperation} empleos técnicos permanentes (estimación de diseño), con prioridad para personas de la zona y programas de formación técnica.</p>`,
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
      a: `<p>The site is chosen through technical studies and public consultation. The criteria: an <strong>industrial or compatible zone</strong> under the local zoning plan, away from homes, outside protected areas and aquifer recharge zones, close to main highways and an electrical substation. <a href="${ROUTES.build.en}">See the criteria and timeline</a>.</p>`,
    },
    {
      q: 'How long does it take to build?',
      a: `<p>Once permits are approved, construction takes about ${PROJECT.constructionMonths} months (design estimate). It’s fast because the design is already proven in hundreds of plants: civil works and equipment manufacturing move forward at the same time.</p>`,
    },
    {
      q: 'Is it legal in Costa Rica?',
      a: `<p>Yes. Law 8839 on Integrated Waste Management includes energy recovery as a form of waste valorization, and since 2015 Decree 39136-S-MINAE has regulated operating conditions and emission limits for this kind of facility. Like any large project, it needs environmental approval from SETENA and municipal permits.</p>`,
    },
    {
      q: 'Will there be public consultation?',
      a: `<p>Yes. The Environmental Impact Study reviewed by SETENA includes public participation, and Reenergy will also hold open sessions in the communities. Sign up on the home page and we’ll let you know the dates.</p>`,
    },
    {
      q: 'Costa Rican trash is very wet. Does it work?',
      a: `<p>Good question. Our trash has a lot of organic matter and moisture. That’s why the plant is designed for that kind of waste: trash rests in a sealed pit to drain before entering the furnace, and the grates are built for wet waste. The international association ISWA sets a minimum heating value; the design is validated with studies of Costa Rica’s actual waste.</p>`,
    },
    {
      q: 'What happens to the ash?',
      a: `<p>Trash shrinks to about a tenth of its volume. Most of what’s left is bottom ash, which can be used as construction material (Denmark reuses nearly all of its own). Metals are recovered for recycling. The fine ash from the filters — a small share — is stabilized and sent to a site licensed for hazardous waste.</p>`,
    },
    {
      q: 'Will my electricity bill go down?',
      a: `<p>We won’t promise that: rates are set by the regulator, ARESEP. What Orchidean One does provide is <strong>firm power</strong>, produced every day, rain or shine. In 2024 there were blackouts and the country spent hundreds of millions of dollars on fuel and electricity imports. Every megawatt that doesn’t depend on rain helps.</p>`,
    },
    {
      q: 'Who pays for the plant?',
      a: `<p>Reenergy makes the investment. Municipalities would pay a fee per tonne delivered — as they pay landfills today — with the advantage of a stable price and a secure destination for their trash.</p>`,
    },
    {
      q: 'How do I know you’ll comply?',
      a: `<p>You won’t have to take our word for it: emissions are measured continuously and published on the <a href="${ROUTES.monitor.en}">monitoring</a> page. The Ministry of Health oversees the plant, and there will be regular independent audits.</p>`,
    },
    {
      q: 'Why not just open more landfills?',
      a: `<p>Because every new landfill needs a huge piece of land no neighborhood wants, and it fills up in a few years. The Central Valley’s landfills are already at their limit and some trash travels over 300 km to Limón. Burying is the most expensive option in the long run: the land is lost, methane is released and the trash stays there forever.</p>`,
    },
    {
      q: 'What jobs does it create?',
      a: `<p>Around ${PROJECT.jobsConstruction.replace('.', ',')} jobs at the peak of construction and some ${PROJECT.jobsOperation} permanent technical jobs (design estimate), with priority for local people and technical training programs.</p>`,
    },
  ],
};
