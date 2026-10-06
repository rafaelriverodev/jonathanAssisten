// importacion de modulos nativos de nodejs para el manejo del sistema de archivos y rutas
const fs = require('fs');
const path = require('path');

// definicion de la ruta absoluta para el directorio de almacenamiento de sesiones
const directorio_sesiones = path.join(__dirname, '../../data/sessions');

// funcion auxiliar para garantizar la existencia del directorio de almacenamiento
const asegurar_directorio_sesiones = () => {
  if (!fs.existsSync(directorio_sesiones)) {
    fs.mkdirSync(directorio_sesiones, { recursive: true });
  }
};

// funcion para sanitizar el identificador de usuario y prevenir inyección de rutas (OWASP A03:2026)
const sanitizar_identificador_usuario = (id_usuario) => {
  if (typeof id_usuario !== 'string') {
    return 'usuario_desconocido';
  }

  // remueve caracteres peligrosos como puntos consecutivos, barras de directorio y caracteres no alfanumericos
  return id_usuario.replace(/[^a-zA-Z0-9_-]/g, '_');
};

// funcion para obtener la ruta completa del archivo JSON de sesion de un usuario
const obtener_ruta_archivo_sesion = (id_usuario) => {
  const id_sanitizado = sanitizar_identificador_usuario(id_usuario);
  return path.join(directorio_sesiones, `${id_sanitizado}.json`);
};

// funcion para cargar el historial de sesion guardado de un usuario
const cargar_historial_sesion = (id_usuario) => {
  try {
    asegurar_directorio_sesiones();
    const ruta_archivo = obtener_ruta_archivo_sesion(id_usuario);

    if (!fs.existsSync(ruta_archivo)) {
      return {
        historial: [],
        rol: 'CLIENTE',
        ultima_actualizacion: null
      };
    }

    const contenido_archivo = fs.readFileSync(ruta_archivo, 'utf8');
    return JSON.parse(contenido_archivo);
  } catch (error_carga) {
    console.error(`[SonTech Error] Fallo al cargar sesion de ${id_usuario}:`, error_carga.message);
    return {
      historial: [],
      rol: 'CLIENTE',
      ultima_actualizacion: null
    };
  }
};

// funcion para guardar o actualizar el historial de sesion de un usuario en disco
const guardar_historial_sesion = (id_usuario, historial_mensajes, rol_usuario = 'CLIENTE') => {
  try {
    asegurar_directorio_sesiones();
    const ruta_archivo = obtener_ruta_archivo_sesion(id_usuario);

    const datos_sesion = {
      id_usuario: sanitizar_identificador_usuario(id_usuario),
      rol: rol_usuario,
      historial: Array.isArray(historial_mensajes) ? historial_mensajes : [],
      ultima_actualizacion: new Date().toISOString()
    };

    fs.writeFileSync(ruta_archivo, JSON.stringify(datos_sesion, null, 2), 'utf8');
    return true;
  } catch (error_guardado) {
    console.error(`[SonTech Error] Fallo al guardar sesion de ${id_usuario}:`, error_guardado.message);
    return false;
  }
};

// funcion para eliminar de forma segura el historial de sesion de disco
const limpiar_historial_sesion = (id_usuario) => {
  try {
    const ruta_archivo = obtener_ruta_archivo_sesion(id_usuario);

    if (fs.existsSync(ruta_archivo)) {
      fs.unlinkSync(ruta_archivo);
    }
    return true;
  } catch (error_limpieza) {
    console.error(`[SonTech Error] Fallo al eliminar sesion de ${id_usuario}:`, error_limpieza.message);
    return false;
  }
};

// exportacion modular explicita con la convencion snake_case
module.exports = {
  sanitizar_identificador_usuario,
  obtener_ruta_archivo_sesion,
  cargar_historial_sesion,
  guardar_historial_sesion,
  limpiar_historial_sesion
};