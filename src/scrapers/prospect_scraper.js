// modulo para la busqueda y prospeccion automatizada de empresas sin sitio web
const axios = require('axios');


// funcion asincrona para analizar un listado de prospectos locales
async function buscar_prospectos_sin_web(categoria_negocio, ciudad_o_region) {
  console.log(`Iniciando prospeccion para categoria: ${categoria_negocio} en ${ciudad_o_region}...`);

  // lista simulada de resultados estructurados para la prospeccion inicial
  const prospectos_encontrados = [
    {
      nombre_empresa: 'Taller Mecanico El Veloce',
      telefono: '+34922001122',
      tiene_sitio_web: false,
      direccion: 'Calle Principal 12, Tenerife',
      puntuacion_google: 4.2
    },
    {
      nombre_empresa: 'Restaurante Sabor Casero',
      telefono: '+34922003344',
      tiene_sitio_web: false,
      direccion: 'Avenida Maritima 45, Tenerife',
      puntuacion_google: 4.5
    },
    {
      nombre_empresa: 'Peluqueria Estilo Moderno',
      telefono: '+34922005566',
      tiene_sitio_web: true,
      direccion: 'Plaza Central 8, Tenerife',
      puntuacion_google: 3.9
    }
  ];

  // filtrado de empresas que estrictamente NO tienen sitio web activo
  const lista_prospectos_calificados = prospectos_encontrados.filter((prospecto) => {
    return prospecto.tiene_sitio_web === false;
  });

  console.log(`Prospeccion finalizada. Se encontraron ${lista_prospectos_calificados.length} negocios sin sitio web.`);

  return lista_prospectos_calificados;
}


// funcion para dar formato de texto claro al reporte de prospectos
function formatear_reporte_prospectos(lista_prospectos) {
  let reporte_texto = '📌 *LISTA DE PROSPECTOS RECOMENDADOS (SIN WEB)* 📌\n\n';

  // iteracion para construir la lista detallada
  lista_prospectos.forEach((prospecto, indice) => {
    reporte_texto += `${indice + 1}. *${prospecto.nombre_empresa}*\n`;
    reporte_texto += `   📞 Teléfono: ${prospecto.telefono}\n`;
    reporte_texto += `   📍 Dirección: ${prospecto.direccion}\n`;
    reporte_texto += `   ⭐ Puntuación: ${prospecto.puntuacion_google}\n\n`;
  });

  reporte_texto += '💡 *Sugerencia de Jonathan:* Utiliza el Script de Cierre Oficial para contactar a estos dueños de negocio.';

  return reporte_texto;
}


// exportacion de funciones del modulo de prospeccion
module.exports = {
  buscar_prospectos_sin_web,
  formatear_reporte_prospectos
};