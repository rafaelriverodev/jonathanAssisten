// importacion del gestor de sesiones y estado de usuario
const { obtener_o_crear_sesion, actualizar_historial_sesion } = require('../services/session_manager');

// importacion del servicio de inteligencia artificial del mentor jonathan
const { generar_respuesta_jonathan } = require('../services/ai_mentor_service');

// importacion de la configuracion y verificacion de embajadores
const { es_embajador_registrado } = require('../../config/embajadores_config');

// funcion auxiliar para sanitizar el texto entrante del mensaje de whatsapp (OWASP A03:2026)
const sanitizar_texto_mensaje = (texto_bruto) => {
  if (typeof texto_bruto !== 'string') {
    return '';
  }

  // eliminacion de caracteres nulos y recorte de espacios en blanco extremos
  return texto_bruto.replace(/\0/g, '').trim();
};

// funcion principal para procesar los mensajes entrantes de whatsapp
async function procesar_mensaje_entrante(cliente_socket, evento_mensaje) {
  try {
    // ignorar mensajes enviados por el propio bot para evitar bucles infinitos
    if (!evento_mensaje.messages || evento_mensaje.messages.length === 0) {
      return;
    }

    const mensaje_actual = evento_mensaje.messages[0];

    if (mensaje_actual.key.fromMe) {
      return;
    }

    // extraccion del identificador del remitente (numero o lid de whatsapp)
    const id_remitente = mensaje_actual.key.remoteJid;

    if (!id_remitente) {
      return;
    }

    // extraccion y sanitizacion del contenido de texto del mensaje
    const texto_mensaje_bruto = mensaje_actual.message?.conversation ||
                               mensaje_actual.message?.extendedTextMessage?.text ||
                               '';

    const texto_mensaje_limpio = sanitizar_texto_mensaje(texto_mensaje_bruto);

    if (!texto_mensaje_limpio) {
      return;
    }

    // verificacion de control de acceso y asignacion de rol (OWASP A01:2026)
    const es_embajador = es_embajador_registrado(id_remitente);
    const rol_usuario = es_embajador ? 'EMBAJADOR' : 'CLIENTE';

    // obtencion o creacion del estado de la sesion del usuario
    const sesion_usuario = obtener_o_crear_sesion(id_remitente, rol_usuario);

    console.log(`[SonTech Audit] Mensaje recibido de: ${id_remitente} | Rol: ${rol_usuario} | Primer Contacto: ${sesion_usuario.es_primer_contacto}`);

    // === DESDE AQUÍ PEGA LA SIGUIENTE PARTE DEL CÓDIGO ===
    // generacion de respuesta utilizando el servicio de inteligencia artificial
    const respuesta_jonathan = await generar_respuesta_jonathan(
      rol_usuario,
      sesion_usuario.es_primer_contacto,
      sesion_usuario.historial,
      texto_mensaje_limpio
    );

    // actualizacion del historial de sesion con los nuevos mensajes
    const nuevo_historial = [
      ...sesion_usuario.historial,
      { rol: 'user', texto: texto_mensaje_limpio },
      { rol: 'model', texto: respuesta_jonathan }
    ];

    actualizar_historial_sesion(id_remitente, nuevo_historial, rol_usuario);

    // envio de la respuesta generada al usuario a traves de whatsapp
    await cliente_socket.sendMessage(id_remitente, {
      text: respuesta_jonathan
    });

    console.log(`[SonTech Audit] Respuesta enviada exitosamente a: ${id_remitente}`);

  } catch (error_procesamiento) {
    console.error('[SonTech Error] Fallo critico procesando el mensaje entrante:', error_procesamiento.message);

    // respuesta de contingencia en caso de fallo inesperado para evitar silencio de cara al usuario
    try {
      const id_remitente = evento_mensaje?.messages?.[0]?.key?.remoteJid;

      if (id_remitente) {
        await cliente_socket.sendMessage(id_remitente, {
          text: 'Hola. En este momento estoy procesando una consulta. Por favor, intentalo de nuevo en unos momentos.'
        });
      }
    } catch (error_envio_fallback) {
      console.error('[SonTech Error] No se pudo enviar el mensaje de fallback:', error_envio_fallback.message);
    }
  }
}

// exportacion modular explicita del manejador de mensajes
module.exports = {
  sanitizar_texto_mensaje,
  procesar_mensaje_entrante
};