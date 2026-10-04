// importacion del servicio de verificacion de embajadores
const { es_embajador_registrado } = require('../../config/embajadores_config');

// almacenamiento en memoria principal para el historial de conversaciones y estado de sesiones
const mapa_sesiones_usuarios = new Map();

// limite maximo de mensajes por historial para mantener la ventana deslizante y evitar desbordamiento de memoria
const LIMITE_HISTORIAL_MENSAJES = 10;

// tiempo limite de inactividad de la sesion en milisegundos (24 horas)
const TIEMPO_INACTIVIDAD_MS = 24 * 60 * 60 * 1000;

// funcion para obtener o inicializar la sesion de un usuario por su identificador jid
function obtener_sesion_usuario(identificador_jid) {
  if (!identificador_jid || typeof identificador_jid !== 'string') {
    throw new Error('[SonTech Error] Identificador JID invalido para obtener la sesion.');
  }

  // determinacion dinamica del rol actual consultando la lista actualizada de embajadores
  const es_embajador_actual = es_embajador_registrado(identificador_jid);
  const rol_calculado = es_embajador_actual ? 'EMBAJADOR' : 'CLIENTE';

  let sesion_existente = mapa_sesiones_usuarios.get(identificador_jid);

  if (!sesion_existente) {
    // creacion de una nueva estructura de sesion si no existe previa
    sesion_existente = {
      jid_usuario: identificador_jid,
      rol: rol_calculado,
      historial: [],
      ultima_interaccion: Date.now()
    };

    mapa_sesiones_usuarios.set(identificador_jid, sesion_existente);
  } else {
    // actualizacion del rol en memoria por si el usuario fue registrado recientemente como embajador
    sesion_existente.rol = rol_calculado;
    sesion_existente.ultima_interaccion = Date.now();
  }

  return sesion_existente;
}

// funcion para guardar un nuevo mensaje en el historial respetando el limite maximo
function guardar_mensaje_historial(identificador_jid, emisor_rol, contenido_texto) {
  if (!contenido_texto || typeof contenido_texto !== 'string') {
    return;
  }

  const sesion_usuario = obtener_sesion_usuario(identificador_jid);

  // construccion del objeto de mensaje para el contexto de la ia
  const nuevo_mensaje = {
    role: emisor_rol === 'user' ? 'user' : 'model',
    parts: [{ text: contenido_texto.trim() }],
    timestamp: Date.now()
  };

  sesion_usuario.historial.push(nuevo_mensaje);

  // mantenimiento de la ventana deslizante eliminando los mensajes mas antiguos si supera el limite
  if (sesion_usuario.historial.length > LIMITE_HISTORIAL_MENSAJES) {
    sesion_usuario.historial.shift();
  }

  sesion_usuario.ultima_interaccion = Date.now();
}

// funcion de mantenimiento para limpiar sesiones inactivas de la memoria principal
function limpiar_sesiones_inactivas() {
  const tiempo_actual = Date.now();
  let contador_sesiones_eliminadas = 0;

  for (const [jid_clave, sesion_datos] of mapa_sesiones_usuarios.entries()) {
    const tiempo_transcurrido = tiempo_actual - sesion_datos.ultima_interaccion;

    if (tiempo_transcurrido > TIEMPO_INACTIVIDAD_MS) {
      mapa_sesiones_usuarios.delete(jid_clave);
      contador_sesiones_eliminadas++;
    }
  }

  if (contador_sesiones_eliminadas > 0) {
    console.log(`[SonTech Maintenance] Se han purgado ${contador_sesiones_eliminadas} sesiones inactivas de la memoria.`);
  }
}

// exportacion modular explicita de las funciones del servicio de historial
module.exports = {
  obtener_sesion_usuario,
  guardar_mensaje_historial,
  limpiar_sesiones_inactivas
};