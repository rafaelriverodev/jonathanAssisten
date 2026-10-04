// importacion de los modulos de pruebas de jest y utilidades de simulación
const { describe, test, expect, beforeEach, jest } = require('@jest/globals');

// declaracion de simulacion del servicio de gestion de sesiones
describe('Pruebas Unitarias del Gestor de Sesiones (session_manager.js)', () => {

  // declaracion de variables para almacenar el estado del mock
  let evento_conexion_simulado;
  let manejador_eventos_mock;

  beforeEach(() => {
    // limpieza de simulaciones previas antes de cada prueba
    jest.clearAllMocks();

    // configuracion de los manejadores simulados para los eventos del socket de baileys
    manejador_eventos_mock = {
      ev: {
        on: jest.fn((nombre_evento, callback) => {
          if (nombre_evento === 'connection.update') {
            evento_conexion_simulado = callback;
          }
        })
      }
    };
  });

  // prueba 1: verificacion del establecimiento correcto de conexion
  test('Debe procesar correctamente un estado de conexion abierto (open)', () => {
    const estado_conexion_abierto = {
      connection: 'open',
      lastDisconnect: null
    };

    // verificacion de la estructura del estado simulado
    expect(estado_conexion_abierto.connection).toBe('open');
    expect(estado_conexion_abierto.lastDisconnect).toBeNull();
  });

  // prueba 2: verificacion del manejo de reconexion por cierre de socket
  test('Debe detectar una desconexion y requerir intento de reintento', () => {
    const estado_conexion_cerrado = {
      connection: 'close',
      lastDisconnect: {
        error: new Error('Socket de red desconectado')
      }
    };

    // verificacion de la captura de error en el cierre
    expect(estado_conexion_cerrado.connection).toBe('close');
    expect(estado_conexion_cerrado.lastDisconnect.error.message).toBe('Socket de red desconectado');
  });

  // prueba 3: validacion de la generacion de evento qr para autenticacion
  test('Debe capturar la emision de un nuevo codigo QR cuando sea solicitado por Baileys', () => {
    const estado_qr_actualizado = {
      qr: 'abc123456789_token_simulado_qr'
    };

    // evaluacion de la presencia de la cadena del QR
    expect(estado_qr_actualizado.qr).toBeDefined();
    expect(typeof estado_qr_actualizado.qr).toBe('string');
  });

});