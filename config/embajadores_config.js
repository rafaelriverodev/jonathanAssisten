// importacion de modulos nativos para lectura de archivos y rutas
const fs = require('fs');
const path = require('path');

// definicion de la ruta absoluta del archivo json de embajadores
const ruta_archivo_embajadores = path.join(__dirname, 'embajadores.json');

// funcion para cargar la lista de embajadores desde la configuracion
function cargar_lista_embajadores() {
  try {
    if (!fs.existsSync(ruta_archivo_embajadores)) {
      console.warn('[SonTech Warn] El archivo embajadores.json no existe en config/');
      return [];
    }

    const contenido_raw = fs.readFileSync(ruta_archivo_embajadores, 'utf-8');
    const datos_parseados = JSON.parse(contenido_raw);

    if (Array.isArray(datos_parseados)) {
      return datos_parseados;
    } else if (datos_parseados && Array.isArray(datos_parseados.embajadores)) {
      return datos_parseados.embajadores;
    }

    return [];
  } catch (error_lectura) {
    console.error(`[SonTech Error] Error al leer config/embajadores.json: ${error_lectura.message}`);
    return [];
  }
}

// funcion utilitaria para extraer unicamente los digitos numericos de una cadena
function extraer_solo_numeros(cadena_identificador) {
  if (!cadena_identificador) {
    return '';
  }

  const cadena_texto = String(cadena_identificador);
  const parte_usuario = cadena_texto.split('@')[0];
  return parte_usuario.replace(/\D/g, '');
}

// funcion para extraer el identificador o numero real desde el objeto de mensaje o clave de baileys
function extraer_identificador_remitente(objeto_mensaje) {
  if (!objeto_mensaje) {
    return '';
  }

  // si se recibe directamente la cadena jid
  if (typeof objeto_mensaje === 'string') {
    return objeto_mensaje;
  }

  // extraccion desde la estructura interna del mensaje de baileys
  const clave_mensaje = objeto_mensaje.key || {};
  const remitente_directo = clave_mensaje.remoteJidAlt || clave_mensaje.participant || clave_mensaje.remoteJid || '';

  return remitente_directo;
}

// funcion principal de verificacion de embajador registrado
function es_embajador_registrado(mensaje_o_identificador) {
  if (!mensaje_o_identificador) {
    return false;
  }

  const identificador_crudo = extraer_identificador_remitente(mensaje_o_identificador);
  const digitos_remitente = extraer_solo_numeros(identificador_crudo);

  if (!digitos_remitente) {
    return false;
  }

  const lista_embajadores = cargar_lista_embajadores();

  const es_coincidencia = lista_embajadores.some((embajador) => {
    const valor_telefono = typeof embajador === 'object' ? (embajador.telefono || embajador.numero || '') : String(embajador);
    const valor_lid = typeof embajador === 'object' ? (embajador.lid || '') : '';

    const digitos_telefono = extraer_solo_numeros(valor_telefono);
    const digitos_lid = extraer_solo_numeros(valor_lid);

    // comprobacion por lid si estuviera presente
    if (digitos_lid && digitos_remitente === digitos_lid) {
      return true;
    }

    if (!digitos_telefono) {
      return false;
    }

    // comparacion por coincidencia exacta o por los ultimos 9 digitos del telefono
    const coincidencia_exacta = digitos_remitente === digitos_telefono;
    const ultimos_digitos_remitente = digitos_remitente.slice(-9);
    const ultimos_digitos_embajador = digitos_telefono.slice(-9);
    const coincidencia_ultimos_9 = ultimos_digitos_remitente.length >= 9 && ultimos_digitos_remitente === ultimos_digitos_embajador;

    return coincidencia_exacta || coincidencia_ultimos_9;
  });

  console.log(`[SonTech Audit] Verificando Remitente: ${identificador_crudo} | Digitos: ${digitos_remitente} | ¿Es Embajador?: ${es_coincidencia}`);

  return es_coincidencia;
}

// exportacion modular explicita
module.exports = {
  cargar_lista_embajadores,
  extraer_solo_numeros,
  extraer_identificador_remitente,
  es_embajador_registrado
};