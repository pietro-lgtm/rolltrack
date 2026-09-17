/**
 * BUNKER GP — genera el Google Form de inscripción de equipos.
 *
 * CÓMO USARLO (una sola vez, ~1 minuto):
 *   1. Entrá a https://script.google.com  →  "Nuevo proyecto".
 *   2. Borrá lo que venga y pegá TODO este archivo.
 *   3. Guardá y dale "Ejecutar" (function: crearFormularioBunkerGP).
 *      Google va a pedir permiso para crear formularios/hojas en tu Drive.
 *   4. Abrí "Registro de ejecución" (Ver → Registro). Ahí quedan:
 *        - el link público del formulario
 *        - el link de la hoja de respuestas
 *        - el bloque de configuración listo para pegar en src/config/site.ts
 *   5. Pasale ese bloque a Claude (o pegalo vos en site.ts → site.race).
 *
 * El formulario queda en TU Drive, con su hoja de respuestas enlazada.
 */

function crearFormularioBunkerGP() {
  var TEAM_SIZE = 6;

  var form = FormApp.create('BUNKER GP — Inscripción de equipos');
  form.setDescription(
    'La primera carrera de NO CORRO NADA: un circuito dentro de un parqueo subterráneo.\n\n' +
      'Se corre en EQUIPOS DE 6. Necesitamos los datos de las 6 personas: nombre, correo, ' +
      'cédula y ritmo promedio (min/km).\n\n' +
      'Buscamos equipos con ritmos variados — mezclá gente rápida con gente que no corre nada. ' +
      'Esa es la gracia.\n\n' +
      'Fecha: sábado 7 de noviembre, 2026. Las invitaciones se envían por correo únicamente a ' +
      'los equipos completos.'
  );

  try {
    form.setProgressBar(true);
  } catch (e) {
    // La barra de progreso no está disponible en todas las cuentas; no importa.
  }

  form.setConfirmationMessage(
    '¡Equipo inscrito! Si quedan cupos, la invitación le llega al correo del capitán/a. ' +
      'Buena actitud y cero excusas.'
  );

  // Orden de los campos: primero el equipo, luego 6 bloques de corredor.
  var fields = [];

  fields.push({
    key: 'teamName',
    item: form.addTextItem().setTitle('Nombre del equipo').setRequired(true),
  });

  for (var i = 1; i <= TEAM_SIZE; i++) {
    form
      .addSectionHeaderItem()
      .setTitle('CORREDOR ' + i + (i === 1 ? ' — capitán/a' : ''))
      .setHelpText(
        i === 1
          ? 'La invitación del equipo llega a este correo.'
          : 'Ritmo promedio en min/km, por ejemplo 6:30.'
      );

    fields.push({
      key: 'nombre' + i,
      item: form.addTextItem().setTitle('Nombre completo — corredor ' + i).setRequired(true),
    });
    fields.push({
      key: 'correo' + i,
      item: form.addTextItem().setTitle('Correo — corredor ' + i).setRequired(true),
    });
    fields.push({
      key: 'cedula' + i,
      item: form.addTextItem().setTitle('Cédula — corredor ' + i).setRequired(true),
    });
    fields.push({
      key: 'pace' + i,
      item: form
        .addTextItem()
        .setTitle('Ritmo promedio min/km — corredor ' + i)
        .setRequired(true),
    });
  }

  // Hoja de respuestas enlazada.
  var sheet = SpreadsheetApp.create('BUNKER GP — Equipos inscritos');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  // Los "entry id" se sacan de una URL prellenada. Usamos un valor centinela
  // único por campo para mapear cada entry id a su campo sin depender del orden.
  var response = form.createResponse();
  for (var f = 0; f < fields.length; f++) {
    response = response.withItemResponse(
      fields[f].item.asTextItem().createResponse('NCNSENTINEL' + f + 'END')
    );
  }
  var prefilled = response.toPrefilledUrl();

  var entryByKey = {};
  var query = prefilled.split('?')[1] || '';
  var pairs = query.split('&');
  for (var p = 0; p < pairs.length; p++) {
    var bits = pairs[p].split('=');
    var value = decodeURIComponent(bits[1] || '');
    var match = /^NCNSENTINEL(\d+)END$/.exec(value);
    if (match) entryByKey[fields[Number(match[1])].key] = bits[0];
  }

  var publishedUrl = form.getPublishedUrl();
  var idMatch = /\/forms\/d\/e\/([^/]+)\//.exec(publishedUrl);
  var formId = idMatch ? idMatch[1] : '(no se pudo leer — copialo del link)';

  function list(prefix) {
    var out = [];
    for (var n = 1; n <= TEAM_SIZE; n++) out.push('"' + (entryByKey[prefix + n] || '') + '"');
    return out.join(', ');
  }

  var config =
    '\n  race: {\n' +
    '    name: "BUNKER GP",\n' +
    '    teamSize: 6,\n' +
    '    dateLabel: "Sábado 7 de noviembre, 2026",\n' +
    '    googleFormId: "' + formId + '",\n' +
    '    googleFormEntries: {\n' +
    '      teamName: "' + (entryByKey.teamName || '') + '",\n' +
    '      nombre: [' + list('nombre') + '],\n' +
    '      correo: [' + list('correo') + '],\n' +
    '      cedula: [' + list('cedula') + '],\n' +
    '      pace: [' + list('pace') + '],\n' +
    '    },\n' +
    '  },\n';

  Logger.log('================ BUNKER GP ================');
  Logger.log('Formulario (público):  ' + publishedUrl);
  Logger.log('Formulario (editar):   ' + form.getEditUrl());
  Logger.log('Hoja de respuestas:    ' + sheet.getUrl());
  Logger.log('');
  Logger.log('PEGAR ESTO EN src/config/site.ts (reemplaza el bloque "race"):');
  Logger.log(config);
  Logger.log('==========================================');

  return { publishedUrl: publishedUrl, sheetUrl: sheet.getUrl(), config: config };
}
