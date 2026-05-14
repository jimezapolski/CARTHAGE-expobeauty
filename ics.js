const DEMOS = [
  { nombre: 'Bio-Regeneración Capilar con Dermapen y Exosomas',            fecha: '20260516', hora: '1130', durMin: 60 },
  { nombre: 'Workshop: Regeneración cutánea inteligente',                   fecha: '20260516', hora: '1310', durMin: 60 },
  { nombre: 'Ritual Sculpt & Glow con Gua Shas y Máscara Bio-Regeneradora',fecha: '20260516', hora: '1530', durMin: 60 },
  { nombre: 'Lanzamiento DNA PRO: PDRN Vegano, NAD+ y Efecto Piel Cristal', fecha: '20260516', hora: '1700', durMin: 60 },
  { nombre: 'Workshop: La nueva arquitectura de la bioregeneración cutánea', fecha: '20260517', hora: '1230', durMin: 60 },
  { nombre: 'DNA PRO + Exosomas: La Nueva Era de la Biotecnología Celular',  fecha: '20260517', hora: '1315', durMin: 60 },
  { nombre: 'Estrategia Despigmentante Multitécnicas con Exosomas',          fecha: '20260517', hora: '1530', durMin: 60 },
  { nombre: 'Protocolo de Biorevitalización: Máscara, Exosomas y PDRN Vegano', fecha: '20260517', hora: '1700', durMin: 60 },
];

function addMinutes(fecha, hora, min) {
  const h = parseInt(hora.slice(0, 2));
  const m = parseInt(hora.slice(2, 4));
  const total = h * 60 + m + min;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return fecha + 'T' + String(nh).padStart(2, '0') + String(nm).padStart(2, '0') + '00';
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now();
}

// Escapa texto para ICS
function esc(str) {
  return str.replace(/[\\,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
}

function generarICS(nombreUsuario, demosSeleccionadas) {
  const eventos = DEMOS.filter((d) => demosSeleccionadas.includes(d.nombre));

  const veventos = eventos.map((d) => {
    const dtstart = d.fecha + 'T' + d.hora + '00';
    const dtend   = addMinutes(d.fecha, d.hora, d.durMin);

    return [
      'BEGIN:VEVENT',
      `UID:${uid()}@carthage-expobeauty`,
      `DTSTART;TZID=America/Argentina/Buenos_Aires:${dtstart}`,
      `DTEND;TZID=America/Argentina/Buenos_Aires:${dtend}`,
      `SUMMARY:${esc(d.nombre)}`,
      `DESCRIPTION:Stand N°2 · ExpoBeauty 2026 · Carthage`,
      `LOCATION:Stand N°2 · ExpoBeauty 2026`,
      // Alarma 30 min antes
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      `DESCRIPTION:🌿 En 30 min: ${esc(d.nombre)} · Stand N°2`,
      'END:VALARM',
      // Alarma 10 min antes
      'BEGIN:VALARM',
      'TRIGGER:-PT10M',
      'ACTION:DISPLAY',
      `DESCRIPTION:⚡ En 10 min: ${esc(d.nombre)} · Stand N°2`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Carthage ExpoBeauty 2026//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Carthage ExpoBeauty 2026',
    'X-WR-TIMEZONE:America/Argentina/Buenos_Aires',
    ...veventos,
    'END:VCALENDAR',
  ].join('\r\n');
}

module.exports = { generarICS, DEMOS };
