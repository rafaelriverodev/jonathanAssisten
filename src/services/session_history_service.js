// modulo para la gestion de sesiones, historial de conversacion y roles de usuarios con soporte nativo para JID y LID
const fs = require('fs'); 

const path = require('path'); 

// mapa en memoria para almacenar las sesiones activas por identificador de whatsapp
const sesiones_usuarios = new Map(); 

// limite maximo de mensajes almacenados en el historial por usuario
const LIMITE_HISTORIAL_MENSAJES = 10; 

// ruta absoluta hacia el archivo de configuracion de embajadores
const ruta_archivo_embajadores = path.join(__dirname, '../../config/embajadores.json'); 


// funcion para cargar la lista de embajadores desde el archivo json de forma segura
function cargar_lista_embajadores() {
  try {
    if (!fs.existsSync(ruta_archivo_embajadores)) {
      return [];
    }

    const contenido_raw = fs.readFileSync(ruta_archivo_embajadores, 'utf-8'); 

    const datos_parseados = JSON.parse(contenido_raw); 

    if (datos_parseados && Array.isArray(datos_parseados.embajadores)) {
      return datos_parseados.embajadores;
    }

    return [];
  } catch (error_lectura) {
    console.error('Error al leer el archivo config/embajadores.json:', error_lectura.message); 
    return [];
  }
} 


// funcion para extraer unicamente los digitos numericos de cualquier cadena
function extraer_solo_numeros(identificador) {
  if (!identificador || typeof identificador !== 'string') {
    return '';
  }

  // tomar la parte previa al arroba y remover cualquier caracter que no sea numero
  const parte_usuario = identificador.split('@')[0]; 

  return parte_usuario.replace(/\D/g, ''); 
} 


// funcion para determinar el rol del usuario evaluando tanto el identificador directo como posibles alternativas
function obtener_rol_usuario(identificador_usuario, identificador_alternativo = null) {
  const numeros_primarios = extraer_solo_numeros(identificador_usuario); 
  const numeros_secundarios = extraer_solo_numeros(identificador_alternativo); 

  if (!numeros_primarios && !numeros_secundarios) {
    return 'cliente';
  }

  // obtener la lista actualizada de embajadores desde el archivo json
  const lista_embajadores_raw = cargar_lista_embajadores(); 

  // extraer solo los digitos numericos de la lista configurada
  const lista_numeros_embajadores = lista_embajadores_raw.map(id => extraer_solo_numeros(id)); 

  // comprobar si el identificador primario o el secundario coinciden con la lista de embajadores
  const coincide_primario = lista_numeros_embajadores.includes(numeros_primarios); 
  const coincide_secundario = lista_numeros_embajadores.includes(numeros_secundarios); 

  if (coincide_primario || coincide_secundario) {
    return 'embajador';
  }

  return 'cliente';
} 


// funcion para obtener o inicializar la sesion de un usuario
function obtener_sesion_usuario(identificador_usuario, identificador_alternativo = null) {
  if (!sesiones_usuarios.has(identificador_usuario)) {
    const rol_detectado = obtener_rol_usuario(identificador_usuario, identificador_alternativo); 

    sesiones_usuarios.set(identificador_usuario, {
      rol: rol_detectado,
      historial: [],
      ultima_interaccion: Date.now()
    }); 
  }

  const sesion = sesiones_usuarios.get(identificador_usuario); 

  // reevaluar el rol en cada interaccion por si cambio el archivo json o la identidad
  sesion.rol = obtener_rol_usuario(identificador_usuario, identificador_alternativo); 
  sesion.ultima_interaccion = Date.now(); 

  return sesion;
} 


// === DESDE AQUÍ PEGA LA SIGUIENTE PARTE DEL CÓDIGO ===
// funcion para agregar un nuevo mensaje al historial respetando el limite maximo
function guardar_mensaje_historial(identificador_usuario, rol_remitente, texto_mensaje) {
  const sesion_actual = obtener_sesion_usuario(identificador_usuario); 

  // estructura del mensaje para el historial compatible con el formato del modelo de ia
  const nuevo_mensaje = {
    role: rol_remitente === 'bot' ? 'model' : 'user',
    parts: [{ text: texto_mensaje }]
  }; 

  sesion_actual.historial.push(nuevo_mensaje); 

  // aplicar ventana deslizante para no superar el limite de mensajes en memoria
  if (sesion_actual.historial.length > LIMITE_HISTORIAL_MENSAJES) {
    sesion_actual.historial = sesion_actual.historial.slice(-LIMITE_HISTORIAL_MENSAJES); 
  }
} 


// funcion para construir las instrucciones de sistema dinamicas segun el rol del usuario
function obtener_prompt_por_rol(rol_usuario) {
  if (rol_usuario === 'embajador') {
    return `
Eres Jonathan, mentor de IA de rafaelriverodev.com. Te estas dirigiendo a un EMBAJADOR O VENDEDOR de la marca.
Tu objetivo principal con los embajadores es:
1. Darles consejos tacticos de ventas, manejo de objeciones y cierres efectivos para Landing Pages.
2. Recordarles la estructura de comisiones (10% de 1 a 4 ventas/semana = 40€; 20% con 5+ ventas = 80€; 10% pasivo recurrente por mantenimiento).
3. Motivarlos, guiarlos con profesionalismo y resolver cualquier duda tecnica sobre nuestros servicios.
4. Hablarles como a un aliado estrategico de negocios.
`;
  }

  // prompt por defecto enfocado a clientes finales
  return `
Eres Jonathan, asesor comercial de IA de rafaelriverodev.com. Te estas dirigiendo a un CLIENTE POTENCIAL.
Tu objetivo principal con los clientes es:
1. Resolver sus dudas sobre desarrollo web, Landing Pages y presencia digital.
2. Explicar los beneficios de la oferta "Llave en Mano" (400€ pago unico, dominio gratis 1er año, mantenimiento 29€/mes desde 2º mes y branding sin coste si no tienen logo).
3. Transmitir confianza, cercania y guiarlos a cerrar la contratacion del servicio de forma natural y sin presion.
`;
} 


// funcion para obtener el contexto completo listo para enviar a la ia
function obtener_contexto_para_ia(identificador_usuario, identificador_alternativo = null) {
  const sesion_actual = obtener_sesion_usuario(identificador_usuario, identificador_alternativo); 
  const prompt_sistema_dinamico = obtener_prompt_por_rol(sesion_actual.rol); 

  return {
    rol: sesion_actual.rol,
    prompt_sistema: prompt_sistema_dinamico,
    historial: sesion_actual.historial
  };
} 


// funcion utilitaria para limpiar sesiones inactivas tras un periodo determinado (prevencion DoS)
function limpiar_sesiones_inactivas(tiempo_inactividad_ms = 1800000) {
  const ahora = Date.now(); 

  for (const [identificador, sesion] of sesiones_usuarios.entries()) {
    if (ahora - sesion.ultima_interaccion > tiempo_inactividad_ms) {
      sesiones_usuarios.delete(identificador); 
    }
  }
} 


// exportacion de funciones del gestor de historial y sesiones
module.exports = {
  obtener_rol_usuario,
  obtener_sesion_usuario,
  guardar_mensaje_historial,
  obtener_contexto_para_ia,
  limpiar_sesiones_inactivas
};