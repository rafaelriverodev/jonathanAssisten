// importacion de los servicios core de inteligencia artificial e historial de sesion
const { generar_respuesta_jonathan } = require('../services/ai_mentor_service');
const {
  obtener_sesion_usuario,
  guardar_mensaje_historial
} = require('../services/session_history_service');

// funcion auxiliar para extraer el texto de un mensaje de baileys en diferentes formatos
function extraer_texto_mensaje(mensaje_baileys) {
  if (!mensaje_baileys || !mensaje_baileys.message) {
    return '';
  }

  const tipo_mensaje = mensaje_baileys.message;

  // extraccion de texto directo o desde mensajes con respuesta/caption
  return (
    tipo_mensaje.conversation ||
    tipo_mensaje.extendedTextMessage?.text ||
    tipo_mensaje.imageMessage?.caption ||
    tipo_mensaje.videoMessage?.caption ||
    ''
  );
}

// controlador principal de eventos de mensajes entrantes de whatsapp
async function procesar_mensaje_entrante_whatsapp(socket_whatsapp, mensaje_entrante) {
  try {
    const identificador_jid_remitente = mensaje_entrante.key.remoteJid;

    // ignorar mensajes de grupos o estados de whatsapp (status@broadcast)
    if (!identificador_jid_remitente || identificador_jid_remitente.endsWith('@g.us') || identificador_jid_remitente === 'status@broadcast') {
      return;
    }

    // extraccion y limpieza del texto del mensaje
    const texto_recibido = extraer_texto_mensaje(mensaje_entrante).trim();

    if (!texto_recibido) {
      return;
    }

    // obtencion del estado de sesion e historial del usuario
    const sesion_usuario = obtener_sesion_usuario(identificador_jid_remitente);
    const es_primer_contacto = sesion_usuario.historial.length === 0;

    // registro del mensaje entrante del usuario en la memoria de la sesion
    guardar_mensaje_historial(identificador_jid_remitente, 'user', texto_recibido);

    // envio del estado de presencia "escribiendo..." en whatsapp para experiencia fluida
    await socket_whatsapp.sendPresenceUpdate('composing', identificador_jid_remitente);

    // generacion de respuesta inteligente a traves del servicio de gemini ia
    const respuesta_jonathan = await generar_respuesta_jonathan(
      sesion_usuario.rol,
      es_primer_contacto,
      sesion_usuario.historial,
      texto_recibido
    );

    // registro de la respuesta enviada por jonathan en el historial
    guardar_mensaje_historial(identificador_jid_remitente, 'bot', respuesta_jonathan);

    // envio de la respuesta generada al usuario a traves del socket de whatsapp
    await socket_whatsapp.sendMessage(identificador_jid_remitente, {
      text: respuesta_jonathan
    });

    // restablecimiento del estado de presencia a disponible
    await socket_whatsapp.sendPresenceUpdate('paused', identificador_jid_remitente);

  } catch (error_controlador_whatsapp) {
    console.error(`[SonTech Error] Error en el controlador de WhatsApp: ${error_controlador_whatsapp.message}`);
  }
}

// exportacion modular del controlador de eventos de whatsapp
module.exports = {
  procesar_mensaje_entrante_whatsapp
};