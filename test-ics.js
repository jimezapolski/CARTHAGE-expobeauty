const fs = require('fs');
const path = require('path');

const inicio = new Date(Date.now() + 3 * 60 * 1000);   // empieza en 3 min
const fin    = new Date(Date.now() + 63 * 60 * 1000);

function pad(n) { return String(n).padStart(2, '0'); }
function dt(d) {
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

const ics = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Carthage ExpoBeauty 2026//ES',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'BEGIN:VEVENT',
  `UID:test-${Date.now()}@carthage`,
  `DTSTART;TZID=America/Argentina/Buenos_Aires:${dt(inicio)}`,
  `DTEND;TZID=America/Argentina/Buenos_Aires:${dt(fin)}`,
  'SUMMARY:🧪 TEST · Demo Carthage ExpoBeauty',
  'DESCRIPTION:Evento de prueba — verificá que las alarmas de 30 y 10 min disparen.',
  'LOCATION:Stand N°2 · ExpoBeauty 2026',
  'BEGIN:VALARM',
  'TRIGGER:-PT2M',
  'ACTION:DISPLAY',
  'DESCRIPTION:🌿 PRUEBA · Demo Carthage empieza en 2 minutos · Stand N°2',
  'END:VALARM',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

const out = path.join(__dirname, 'test-carthage.ics');
fs.writeFileSync(out, ics, 'utf8');

console.log('✓ Archivo creado:', out);
console.log(`  Evento empieza a las ${inicio.toLocaleTimeString('es-AR')}`);
console.log(`  Alarma → debería disparar en ~1 minuto`);
