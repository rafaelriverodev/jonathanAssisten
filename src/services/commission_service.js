// modulo de servicios para el calculo de comisiones e ingresos pasivos del programa de embajadores

// declaracion de constantes de precios base segun la oferta comercial
const precio_landing_recomendada = 400.00;

const precio_mantenimiento_mensual = 29.00;


// funcion para calcular la comision por venta segun el tipo de producto y cantidad semanal
function calcular_comision_venta(tipo_producto, cantidad_ventas_semanales) {
  // variable para almacenar el total de la comision calculada
  let total_comision_calculada = 0.0;

  // evaluacion para el tipo de producto landing recomendada
  if (tipo_producto === 'recomendada') {
    // aplicar 20% a partir de 5 ventas semanales o 10% de 1 a 4 ventas
    if (cantidad_ventas_semanales >= 5) {
      const porcentaje_comision_extra = 0.20;
      total_comision_calculada = (precio_landing_recomendada * porcentaje_comision_extra) * cantidad_ventas_semanales;
    } else {
      const porcentaje_comision_base = 0.10;
      total_comision_calculada = (precio_landing_recomendada * porcentaje_comision_base) * cantidad_ventas_semanales;
    }
  }

  // evaluacion para el tipo de producto landing profesional
  if (tipo_producto === 'profesional') {
    const precio_landing_profesional = 500.00;
    const porcentaje_comision_profesional = 0.20;
    total_comision_calculada = (precio_landing_profesional * porcentaje_comision_profesional) * cantidad_ventas_semanales;
  }

  // retornar el resultado redondeado a 2 decimales para evitar imprecisiones flotantes
  return Number(total_comision_calculada.toFixed(2));
}


// funcion para calcular los ingresos pasivos recurrentes por carteras activas
function calcular_ingreso_pasivo_recurrente(cantidad_clientes_activos) {
  // porcentaje del 10% recurrente sobre el mantenimiento de 29€/mes (2.90€ por cliente)
  const porcentaje_recurrente = 0.10;
  
  const ingreso_por_cliente = precio_mantenimiento_mensual * porcentaje_recurrente;

  const total_ingreso_pasivo = ingreso_por_cliente * cantidad_clientes_activos;

  // formatear y retornar con redondeo preciso de 2 decimales para calculo financiero
  return Number(total_ingreso_pasivo.toFixed(2));
}


// exportacion de funciones del modulo
module.exports = {
  calcular_comision_venta,
  calcular_ingreso_pasivo_recurrente
};