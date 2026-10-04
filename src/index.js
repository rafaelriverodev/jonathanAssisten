// importacion de las variables de entorno y validacion de credenciales
require('dotenv').config();

// importacion del gestor de sesiones de whatsapp y el controlador de eventos
const { inicializar_conexion_whatsapp } = require('./services/session_manager');
const { procesar_mensaje_entrante_whatsapp } = require('./bot/whatsapp_controller');
const { limpiar_sesiones_inactivas } = require('./services/session_history_service');

// funcion principal asincrona para el arranque del servidor de jonathan
async function arrancar_servidor_jonathan() {
  console.log('================================================================');
  console.log('[SonTech Startup] INICIANDO SERVIDOR PROYECTO JONATHAN ASSISTANT');
  console.log('[SonTech Startup] Entorno: ' + (process.env.NODE_ENV || 'development'));
  console.log('================================================================');

  // verificacion previa de la presencia de la clave de api de google genai
  if (!process.env.GEMINI_API_KEY) {
    console.error('[SonTech Critical Error] La variable GEMINI_API_KEY no esta configurada en el archivo .env.');
    process.exit(1);
  }

  try {
    // inicializacion de la conexion con whatsapp pasando el controlador como callback
    await inicializar_conexion_whatsapp(procesar_mensaje_entrante_whatsapp);

    // configuracion de intervalo de limpieza automatica de sesiones inactivas cada 30 minutos
    const INTERVALO_LIMPIEZA_MS = 30 * 60 * 1000;
    setInterval(() => {
      limpiar_sesiones_inactivas();
      console.log('[SonTech Maintenance] Limpieza periodica de memoria ejecutada con exito.');
    }, INTERVALO_LIMPIEZA_MS);

  } catch (error_arranque) {
    console.error(`[SonTech Critical Error] Fallo catastrofico al iniciar el servidor: ${error_arranque.message}`);
    process.exit(1);
  }
}

// ejecucion del arranque del servidor
arrancar_servidor_jonathan();