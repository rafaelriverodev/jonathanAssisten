// archivo de pruebas unitarias para el calculo de comisiones de embajadores
const { 
  calcular_comision_venta, 
  calcular_ingreso_pasivo_recurrente 
} = require('../src/services/commission_service');


// prueba para ventas individuales de landing recomendada en rango de 1 a 4 ventas
test('debe calcular 10% de comision para menos de 5 ventas de landing recomendada', () => {
  const total_comision = calcular_comision_venta('recomendada', 3);
  
  expect(total_comision).toBe(120.00); // 40€ * 3
});


// prueba para bonificacion por volumen extra de 5 o mas ventas semanales
test('debe calcular 20% de comision para 5 o mas ventas de landing recomendada', () => {
  const total_comision = calcular_comision_venta('recomendada', 5);
  
  expect(total_comision).toBe(400.00); // 80€ * 5
});


// prueba para comisiones de landing profesional
test('debe calcular 20% de comision para landing profesional desde la primera venta', () => {
  const total_comision = calcular_comision_venta('profesional', 2);
  
  expect(total_comision).toBe(200.00); // 100€ * 2 (asumiendo base profesional)
});


// prueba para ingresos pasivos recurrentes por mantenimiento mensual
test('debe calcular el 10% de ingreso pasivo por mantenimiento acumulado', () => {
  const clientes_activos = 20;
  const ingreso_pasivo_total = calcular_ingreso_pasivo_recurrente(clientes_activos);
  
  expect(ingreso_pasivo_total).toBe(58.00); // 2.90€ * 20
});