# Carthage ExpoBeauty — Sistema de alertas WhatsApp

Backend Node.js que envía alertas automáticas por WhatsApp Business a los asistentes registrados en el stand de Carthage en ExpoBeauty (16–17 mayo 2026).

---

## Stack

- **Node.js + Express** — servidor HTTP
- **better-sqlite3** — base de datos local
- **node-cron** — scheduler cada minuto
- **Twilio WhatsApp Business API** — envío de mensajes

---

## Instalación rápida

```bash
# 1. Clonar/copiar los archivos y entrar al directorio
cd carpeta-del-proyecto

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editá .env con tus credenciales (ver sección Twilio abajo)

# 4. Arrancar (producción)
TZ=America/Argentina/Buenos_Aires node server.js

# Arrancar en desarrollo (con auto-reload)
TZ=America/Argentina/Buenos_Aires npx nodemon server.js
```

> **Importante:** el prefijo `TZ=America/Argentina/Buenos_Aires` asegura que el scheduler compare horarios en hora local argentina. Sin esto los mensajes se enviarían con desfase de 3 horas.

---

## Cómo obtener credenciales de Twilio

### 1. Crear cuenta Twilio
1. Ir a [twilio.com](https://www.twilio.com) → **Sign up**
2. Verificar tu email y número de teléfono

### 2. Obtener Account SID y Auth Token
1. Entrás al **Console** (console.twilio.com)
2. En la pantalla principal ves **Account SID** y **Auth Token** → copiarlos al `.env`

### 3. Activar WhatsApp Sandbox (para pruebas)
1. En el menú izquierdo: **Messaging → Try it out → Send a WhatsApp message**
2. Seguís las instrucciones: mandar el código `join <palabra>` al número `+1 415 523 8886` desde tu WhatsApp
3. Ese número es tu `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886`

### 4. WhatsApp Business aprobado (para producción)
Para enviar a cualquier número sin que ellos aprueben primero:
1. Console → **Messaging → Senders → WhatsApp Senders**
2. Solicitar un número propio aprobado por Meta (proceso tarda 1–7 días)
3. Actualizar `TWILIO_WHATSAPP_FROM` con el número aprobado

> **Nota Sandbox:** con el Sandbox solo podés enviar a números que hayan enviado el mensaje de opt-in. Ideal para testear antes del evento.

---

## Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `TWILIO_ACCOUNT_SID` | Account SID del dashboard Twilio |
| `TWILIO_AUTH_TOKEN` | Auth Token del dashboard Twilio |
| `TWILIO_WHATSAPP_FROM` | Número de origen — `whatsapp:+14155238886` (sandbox) |
| `ADMIN_PASSWORD` | Password para acceder a `GET /api/registros` |
| `PORT` | Puerto del servidor (default: 3000) |

---

## Endpoints

### `POST /api/registro`
Registra un asistente y las demos que seleccionó.

**Body JSON:**
```json
{
  "nombre": "María García",
  "telefono": "011 1534-567890",
  "demos": ["DNA PRO · PDRN Vegano y Efecto Piel Cristal", "Bio-Regeneración Capilar con Dermapen"]
}
```

**Respuesta exitosa:**
```json
{ "ok": true, "id": 42 }
```

Los teléfonos se normalizan automáticamente a formato E.164 (`+54911xxxxxxxx`).

---

### `GET /api/registros`
Lista todos los registros y alertas enviadas. Requiere autenticación.

**Header:**
```
Authorization: Bearer <ADMIN_PASSWORD>
```

---

## Lógica de alertas

El scheduler corre **cada minuto** y evalúa cada demo del schedule:

| Ventana de tiempo | Tipo de alerta |
|---|---|
| 28–32 min antes | `30min` |
| 8–12 min antes | `10min` |
| ±2 min del inicio | `inicio` |
| 28–32 min después del inicio | `30min_despues` |

Antes de cada envío verifica en `alertas_enviadas` que no se haya mandado ya (evita duplicados aunque el proceso se reinicie).

---

## Estructura de archivos

```
server.js          ← servidor Express + endpoints
db.js              ← inicialización SQLite (crea tablas automáticamente)
scheduler.js       ← cron + lógica de alertas
whatsapp.js        ← wrapper Twilio
expobeauty.html    ← frontend con formulario conectado al backend
package.json
.env.example
```

---

## Testear sin esperar los horarios reales

Desde la consola Node podés forzar un envío de prueba:

```js
// test-envio.js
require('dotenv').config();
const { sendWhatsApp } = require('./whatsapp');
sendWhatsApp('+5491112345678', '🌿 Test de alerta Carthage ExpoBeauty')
  .then(sid => console.log('Enviado, SID:', sid))
  .catch(console.error);
```

```bash
node test-envio.js
```
