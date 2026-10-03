// importacion y definicion de la lista de numeros autorizados con rol de embajador
const lista_embajadores = [
  '88399117562053@lid', 
  '34600000000@s.whatsapp.net' 
]; 


// funcion defensiva para determinar el rol del usuario que envia el mensaje
function obtener_rol_usuario(numero_remitente_bruto) {
  try {
    // validacion de seguridad para comprobar que el parametro sea una cadena de texto valida
    if (!numero_remitente_bruto || typeof numero_remitente_bruto !== 'string') {
      return 'CLIENTE_POTENCIAL'; 
    } 

    // comprobacion estricta de que la variable de embajadores sea efectivamente un arreglo
    if (!Array.isArray(lista_embajadores)) {
      console.warn('[SonTech Security Warning] La variable lista_embajadores no es un arreglo valido.'); 
      return 'CLIENTE_POTENCIAL'; 
    } 

    // sanitizacion del numero de telefono entrante
    const identificador_sanitizado = numero_remitente_bruto.trim().toLowerCase(); 

    // verificacion de presencia en el arreglo de embajadores
    const es_embajador = lista_embajadores.some((embajador) => {
      if (typeof embajador !== 'string') {
        return false; 
      } 
      
      return embajador.trim().toLowerCase() === identificador_sanitizado; 
    }); 

    if (es_embajador) {
      return 'EMBAJADOR'; 
    } 

    return 'CLIENTE_POTENCIAL'; 

  } catch (error_obtencion_rol) {
    console.error('[SonTech Security Error] Error al evaluar el rol del usuario:', error_obtencion_rol.message); 
    
    // principio de menor privilegio: ante un error inesperado, se asigna el rol con menos permisos
    return 'CLIENTE_POTENCIAL'; 
  } 
} 


// exportacion modular de la lista de embajadores y la funcion de asignacion de roles
module.exports = {
  lista_embajadores,
  obtener_rol_usuario
};