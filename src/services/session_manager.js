// importacion del modulo de sistema de archivos y rutas de node.js
const fs = require('fs');
const path = require('path');

// importacion de los modulos oficiales del protocolo baileys para whatsapp web (2026)
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

// importacion de la configuracion del entorno y utilidades de log
const { env_config } = require('../../config/env_config');

// ruta de almacenamiento de la sesion persistente de baileys
const ruta_directorio_sesion = path.join(__dirname, '../../auth_info_baileys');

// variable global para almacenar la instancia del socket de whatsapp
let socket_whatsapp_instancia = null;

// funcion auxiliar para crear el directorio de sesion si no existe
function asegurar_directorio_sesion() {
  if (!fs.existsSync(ruta_directorio_sesion)) {
    fs.mkdirSync(ruta_directorio_sesion, { recursive: true, mode: 0o700 });
  }
}

// funcion asincrona principal para inicializar el socket y gestionar la sesion
async function inicializar_conexion_whatsapp(manejador_mensajes_callback) {
  // impresion de estado de inicio de inicializacion
  console.log('[SonTech System] Inicializando modulo de conexion con WhatsApp...');

  // aseguramiento previo de la existencia de la carpeta de autenticacion
  asegurar_directorio_sesion();

  // carga del estado de autenticacion multi-archivo
  const { state: estado_autenticacion, saveCreds: guardar_credenciales } = await useMultiFileAuthState(ruta_directorio_sesion);

  // obtencion de la version mas reciente compatible del protocolo baileys
  const { version: version_baileys, isLatest: es_ultima_version } = await fetchLatestBaileysVersion();
  console.log(`[SonTech System] Usando version de Baileys v${version_baileys.join('.')} (Ultima version: ${es_ultima_version})`);

  // creacion de la configuracion del socket de baileys
  socket_whatsapp_instancia = makeWASocket({
    version: version_baileys,
    auth: estado_autenticacion,
    printQRInTerminal: true,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    syncFullHistory: false
  });

  // suscripcion al evento de actualizacion de credenciales para persistir datos
  socket_whatsapp_instancia.ev.on('creds.update', guardar_credenciales);

// === DESDE AQUÍ PEGA LA SIGUIENTE PARTE DEL CÓDIGO ===
// suscripcion al evento de actualizacion de la conexion de baileys
  socket_whatsapp_instancia.ev.on('connection.update', async (actualizacion_conexion) => {
    const { connection: estado_conexion, lastDisconnect: ultima_desconexion, qr: codigo_qr } = actualizacion_conexion;

    // caso 1: impresion del codigo qr en consola para vinculacion
    if (codigo_qr) {
      console.log('[SonTech System] Nuevo codigo QR generado. Escanealo desde WhatsApp en tu dispositivo movil:');
    }

    // caso 2: verificacion del cierre de la conexion
    if (estado_conexion === 'close') {
      const codigo_estado_error = ultima_desconexion?.error?.output?.statusCode;
      const motivo_desconexion = ultima_desconexion?.error?.message || 'Razon desconocida';

      console.warn(`[SonTech Warning] Conexion de WhatsApp cerrada. Motivo: ${motivo_desconexion} (Codigo: ${codigo_estado_error})`);

      // evaluacion de si el fallo permite reconexion automatica
      const debe_reconectar = codigo_estado_error !== DisconnectReason.loggedOut;

      if (debe_reconectar) {
        console.log('[SonTech System] Intentando reconexion automatica con los servidores de WhatsApp en 5 segundos...');
        setTimeout(() => {
          inicializar_conexion_whatsapp(manejador_mensajes_callback);
        }, 5000);
      } else {
        console.error('[SonTech Security Alert] Sesion cerrada por el usuario o token revocado. Eliminando credenciales locales...');
        fs.rmSync(ruta_directorio_sesion, { recursive: true, force: true });
        console.log('[SonTech System] Reinicie la aplicacion para escanear un nuevo codigo QR.');
      }
    }

    // caso 3: confirmacion de conexion establecida con exito
    if (estado_conexion === 'open') {
      console.log('================================================================');
      console.log('[SonTech Success] CONEXION ESTABLECIDA CON EXITO CON WHATSAPP');
      console.log('[SonTech Success] Jonathan esta en linea y listo para recibir mensajes.');
      console.log('================================================================');
    }
  });

  // escucha de mensajes entrantes en el socket
  socket_whatsapp_instancia.ev.on('messages.upsert', async (evento_mensajes) => {
    try {
      // filtrado para procesar unicamente mensajes de texto entrantes
      if (evento_mensajes.type !== 'notify') return;

      for (const mensaje_entrante of evento_mensajes.messages) {
        // ignorar mensajes enviados por el propio bot
        if (mensaje_entrante.key.fromMe) continue;

        // invocacion del callback del controlador de whatsapp
        if (typeof manejador_mensajes_callback === 'function') {
          await manejador_mensajes_callback(socket_whatsapp_instancia, mensaje_entrante);
        }
      }
    } catch (error_procesamiento_mensaje) {
      console.error(`[SonTech Error] Error procesando mensaje de entrada: ${error_procesamiento_mensaje.message}`);
    }
  });

  return socket_whatsapp_instancia;
}

// funcion para obtener la instancia activa del socket
function obtener_socket_whatsapp() {
  return socket_whatsapp_instancia;
}

// exportacion modular del gestor de sesiones de whatsapp
module.exports = {
  inicializar_conexion_whatsapp,
  obtener_socket_whatsapp
};