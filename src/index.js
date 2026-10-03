// importacion del modulo express para el servidor de monitoreo y health check
const express = require('express'); 

// importacion del modulo path para la resolucion segura de rutas internas
const path = require('path'); 

// resolucion de rutas hacia la configuracion de entorno y servicios del bot
const ruta_configuracion = path.join(__dirname, '../config/env_config'); 
const ruta_servicio_baileys = path.join(__dirname, 'bot/whatsapp_client'); 
const ruta_manejador_mensajes = path.join(__dirname, 'bot/message_handler'); 

const { configuraciones_entorno } = require(ruta_configuracion); 
const { conectar_cliente_whatsapp } = require(ruta_servicio_baileys); 

// importacion corregida coincidiendo con las exportaciones de message_handler.js
const { registrar_eventos_bot } = require(ruta_manejador_mensajes); 

// inicializacion de la aplicacion express
const aplicacion_express = express(); 

// puerto configurado por entorno o valor por defecto
const puerto_servidor = configuraciones_entorno.puerto_servidor || process.env.PORT || 3000; 

// middleware para parsear solicitudes con formato json
aplicacion_express.use(express.json()); 


// ruta de verificacion de estado de salud del sistema (health check)
aplicacion_express.get('/health', (solicitud_http, respuesta_http) => {
  respuesta_http.status(200).json({
    estado: 'ok',
    servicio: 'Jonathan Assistant - SonTech Core',
    marca_tiempo: new Date().toISOString()
  }); 
}); 


// funcion principal para la inicializacion orquestada del sistema
async function iniciar_sistema_jonathan() {
  console.log('Iniciando procesos del asistente Jonathan...'); 
  console.log('Validacion de variables de entorno exitosa.'); 

  // levantamiento del servidor express
  const servidor_http = aplicacion_express.listen(puerto_servidor, () => {
    console.log(`Servidor HTTP activo en el puerto ${puerto_servidor}`); 
  }).on('error', (error_servidor) => {
    if (error_servidor.code === 'EADDRINUSE') {
      console.error(`[SonTech Security Error] El puerto ${puerto_servidor} esta en uso. Cierra el proceso anterior antes de reiniciar.`); 
      process.exit(1); 
    } else {
      console.error('[SonTech Security Error] Error al iniciar el servidor HTTP:', error_servidor.message); 
    }
  }); 

  try {
    console.log('Conectando con el servicio de WhatsApp...'); 

    // inicializacion de la conexion de baileys
    const instancia_whatsapp = await conectar_cliente_whatsapp(); 

    // verificacion de validez de la funcion importada antes de ejecutar
    if (typeof registrar_eventos_bot === 'function') {
      registrar_eventos_bot(instancia_whatsapp); 
      console.log('Manejador de mensajes de WhatsApp registrado exitosamente.'); 
    } else {
      console.error('Error critico: registrar_eventos_bot no fue exportado correctamente desde message_handler.js.'); 
    }

  } catch (error_conexion_whatsapp) {
    console.error('Error critico al conectar con el servicio de WhatsApp:', error_conexion_whatsapp.message); 
  }
} 


// captura global de excepciones no controladas para evitar caidas imprevistas (OWASP A05:2026)
process.on('uncaughtException', (error_excepcion) => {
  console.error('[SonTech Process Guard] Excepcion no capturada detectada:', error_excepcion.message); 
}); 

process.on('unhandledRejection', (razon_rechazo) => {
  console.error('[SonTech Process Guard] Promesa rechazada no manejada:', razon_rechazo); 
}); 


// ejecucion del arranque del sistema
iniciar_sistema_jonathan();