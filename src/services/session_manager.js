// mapa en memoria para almacenar las sesiones activas por numero de telefono
const mapa_sesiones_activas = new Map(); 

// tiempo limite de inactividad en milisegundos para reiniciar la presentacion (30 minutos)
const tiempo_expiracion_sesion_ms = 30 * 60 * 1000; 


// funcion encargada de obtener o crear la sesion de un usuario
function obtener_o_crear_sesion(numero_telefono_limpio) {
  const tiempo_actual = Date.now(); 
  const sesion_existente = mapa_sesiones_activas.get(numero_telefono_limpio); 

  if (sesion_existente) {
    const tiempo_transcurrido = tiempo_actual - sesion_existente.ultima_interaccion; 

    if (tiempo_transcurrido < tiempo_expiracion_sesion_ms) {
      // actualizacion del timestamp de ultima interaccion
      sesion_existente.ultima_interaccion = tiempo_actual; 
      sesion_existente.es_primer_contacto = false; 

      return sesion_existente; 
    } 
  } 

  // creacion de una nueva sesion limpia por expiracion o inicio
  const nueva_sesion = {
    numero_telefono: numero_telefono_limpio,
    ultima_interaccion: tiempo_actual,
    es_primer_contacto: true,
    historial_mensajes: []
  }; 

  mapa_sesiones_activas.set(numero_telefono_limpio, nueva_sesion); 

  return nueva_sesion; 
} 


// funcion para registrar un nuevo mensaje en el historial de la sesion
function registrar_mensaje_en_historial(numero_telefono_limpio, rol_emisor, contenido_mensaje) {
  const sesion = obtener_o_crear_sesion(numero_telefono_limpio); 

  sesion.historial_mensajes.push({
    rol: rol_emisor,
    contenido: contenido_mensaje,
    timestamp: Date.now()
  }); 

  // limitacion del historial a los ultimos 10 mensajes para no saturar el contexto de la ia
  if (sesion.historial_mensajes.length > 10) {
    sesion.historial_mensajes.shift(); 
  } 
} 


// funcion encargada de verificar si se debe emitir saludo/presentacion inicial
function debe_presentarse_usuario(numero_telefono_limpio) {
  const sesion = obtener_o_crear_sesion(numero_telefono_limpio); 

  return sesion.es_primer_contacto; 
} 


// exportacion modular de las funciones del gestor de sesiones
module.exports = {
  obtener_o_crear_sesion,
  registrar_mensaje_en_historial,
  debe_presentarse_usuario
};