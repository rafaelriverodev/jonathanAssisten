// modulo para la configuracion y validacion segura de variables de entorno
const dotenv = require('dotenv');

// cargar variables desde el archivo .env
dotenv.config();


// funcion para validar que todas las variables criticas existan antes de iniciar el sistema
function validar_variables_entorno() {
  const variables_requeridas = [
    'GEMINI_API_KEY',
    'PUERTO_SERVIDOR',
    'EMAIL_ADMINISTRADOR'
  ];

  const variables_faltantes = [];

  // iteracion para comprobar la existencia de cada variable requerida
  for (const variable of variables_requeridas) {
    if (!process.env[variable]) {
      variables_faltantes.push(variable);
    }
  }

  // lanzar un error de seguridad si falta alguna variable esencial
  if (variables_faltantes.length > 0) {
    throw new Error(`Error de Seguridad: Faltan las siguientes variables de entorno: ${variables_faltantes.join(', ')}`);
  }

  return true;
}


// objeto centralizado con la configuracion cargada y sanitizada
const configuraciones_entorno = {
  gemini_api_key: process.env.GEMINI_API_KEY || '',

  puerto_servidor: parseInt(process.env.PUERTO_SERVIDOR, 10) || 3000,

  email_administrador: process.env.EMAIL_ADMINISTRADOR || 'administrador@rafaelriverodev.com',

  entorno_ejecucion: process.env.NODE_ENV || 'development'
};


// exportacion del modulo de configuracion
module.exports = {
  validar_variables_entorno,
  configuraciones_entorno
};