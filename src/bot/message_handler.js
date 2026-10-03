// importacion del gestor de sesiones para control de contexto y caducidad
const { 
  obtener_o_crear_sesion, 
  registrar_mensaje_en_historial, 
  debe_presentarse_usuario 
} = require('../services/session_manager'); 

// importacion de la configuracion desde la raiz config/embajadores_config.js
const { obtener_rol_usuario } = require('../../config/embajadores_config'); 

// importacion del servicio principal de inteligencia artificial de jonathan
const { generar_respuesta_jonathan } = require('../services/ai_mentor_service'); 


// funcion principal para escuchar y procesar los mensajes entrantes de whatsapp
function registrar_manejador_mensajes(instancia_socket_whatsapp) {
  instancia_socket_whatsapp.ev.on('messages.upsert', async (evento_mensaje) => {
    try {
      const mensaje_recibido = evento_mensaje.messages[0]; 

      // ignorar mensajes enviados por el propio bot o mensajes del sistema
      if (!mensaje_recibido || mensaje_recibido.key.fromMe) {
        return; 
      } 

      // identificador del remitente (numero de telefono)
      const numero_remitente_bruto = mensaje_recibido.key.remoteJid; 

      // extraccion del contenido de texto plano del mensaje
      const texto_mensaje_usuario = mensaje_recibido.message?.conversation || 
                                    mensaje_recibido.message?.extendedTextMessage?.text || 
                                    ''; 

      if (!texto_mensaje_usuario.trim()) {
        return; 
      } 

      console.log(`[SonTech Bot Log] Mensaje recibido de ${numero_remitente_bruto}: "${texto_mensaje_usuario}"`); 

      // 1. identificacion dinamica de rol (EMBAJADOR o CLIENTE_POTENCIAL)
      const rol_usuario = obtener_rol_usuario(numero_remitente_bruto); 

      // 2. gestion de estado de sesion y control de presentaciones repetitivas
      const sesion_usuario = obtener_o_crear_sesion(numero_remitente_bruto); 
      const es_primer_contacto = debe_presentarse_usuario(numero_remitente_bruto); 

      // 3. generacion de la respuesta usando el servicio de inteligencia artificial
      const respuesta_generada_jonathan = await generar_respuesta_jonathan(
        rol_usuario,
        es_primer_contacto,
        sesion_usuario.historial_mensajes,
        texto_mensaje_usuario
      ); 

      // 4. registro de la interaccion en la memoria de la sesion
      registrar_mensaje_en_historial(numero_remitente_bruto, 'user', texto_mensaje_usuario); 
      registrar_mensaje_en_historial(numero_remitente_bruto, 'bot', respuesta_generada_jonathan); 

      // 5. envio de la respuesta generada al cliente por whatsapp
      await instancia_socket_whatsapp.sendMessage(numero_remitente_bruto, {
        text: respuesta_generada_jonathan
      }); 

      console.log(`[SonTech Bot Log] Respuesta enviada con exito a ${numero_remitente_bruto}`); 

    } catch (error_manejador) {
      console.error('[SonTech Security Error] Error al procesar el mensaje entrante:', error_manejador.message); 
    } 
  }); 
} 


// exportacion modular de la funcion con alias para evitar discrepancias de importacion
module.exports = {
  registrar_manejador_mensajes,
  registrar_eventos_bot: registrar_manejador_mensajes
};