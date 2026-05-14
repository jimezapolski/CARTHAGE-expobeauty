const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data.json');

function load() {
  if (!fs.existsSync(FILE)) return { nextId: 1, registros: [] };
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
}

function insertar(nombre, demos_seleccionadas) {
  const data = load();
  const reg = {
    id: data.nextId++,
    nombre,
    demos_seleccionadas,
    fecha_registro: new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
  };
  data.registros.push(reg);
  save(data);
  return reg;
}

function todos() {
  return load().registros;
}

function porId(id) {
  return load().registros.find(r => r.id === Number(id));
}

module.exports = { insertar, todos, porId };
