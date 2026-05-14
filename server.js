require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./db');
const { generarICS, DEMOS } = require('./ics');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const TODOS = DEMOS.map((d) => d.nombre);

function expandirDemos(seleccionadas) {
  if (!Array.isArray(seleccionadas) || seleccionadas.length === 0) return [];
  if (seleccionadas.includes('Todos los workshops y demos')) return TODOS;
  return seleccionadas.filter((s) => TODOS.includes(s));
}

// ─── Registro ─────────────────────────────────────────────────────────────────
app.post('/api/registro', (req, res) => {
  const { nombre, demos } = req.body;

  if (!nombre || !Array.isArray(demos) || demos.length === 0) {
    return res.status(400).json({ ok: false, error: 'Faltan campos requeridos.' });
  }

  const demosExpandidas = expandirDemos(demos);
  if (demosExpandidas.length === 0) {
    return res.status(400).json({ ok: false, error: 'No se reconocieron demos válidas.' });
  }

  const reg = db.insertar(nombre.trim(), demosExpandidas);
  console.log(`[Registro] #${reg.id} ${reg.nombre} → ${demosExpandidas.length} demos`);
  res.json({ ok: true, id: reg.id });
});

// ─── Descarga .ics ────────────────────────────────────────────────────────────
app.get('/api/ics/:id', (req, res) => {
  const reg = db.porId(req.params.id);
  if (!reg) return res.status(404).send('Registro no encontrado.');

  const ics = generarICS(reg.nombre, reg.demos_seleccionadas);
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="carthage-expobeauty.ics"');
  res.send(ics);
});

// ─── Test .ics (evento en 31 min) ────────────────────────────────────────────
app.get('/api/ics/test', (req, res) => {
  const inicio = new Date(Date.now() + 31 * 60 * 1000);
  const fin    = new Date(Date.now() + 91 * 60 * 1000);

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
    'DESCRIPTION:Evento de prueba.',
    'LOCATION:Stand N°2 · ExpoBeauty 2026',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:🌿 En 30 min: Demo Carthage · Stand N°2',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT10M',
    'ACTION:DISPLAY',
    'DESCRIPTION:⚡ En 10 min: Demo Carthage · Stand N°2',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="test-carthage.ics"');
  res.send(ics);
});

// ─── Panel admin ──────────────────────────────────────────────────────────────
app.get('/api/registros', (req, res) => {
  const auth = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (auth !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'No autorizado.' });
  }
  res.json({ ok: true, registros: db.todos() });
});

// ─── Arranque ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[Server] http://localhost:${PORT}`));
