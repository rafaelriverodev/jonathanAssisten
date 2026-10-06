// importacion de las funciones a evaluar desde el servicio de historial de sesiones
const {
  sanitizar_identificador_usuario,
  obtener_ruta_archivo_sesion,
  cargar_historial_sesion,
  guardar_historial_sesion,
  limpiar_historial_sesion
} = require('../src/services/session_history_service');

// definicion de identificadores ficticios para ejecucion de pruebas
const id_usuario_valido = '34600112233';
const id_usuario_malicioso = '../../etc/passwd';

// suite principal de pruebas unitarias para el servicio de historial
describe('Suite de Pruebas: src/services/session_history_service.js', () => {

  // limpieza previa de archivos generados por pruebas anteriores
  beforeAll(() => {
    limpiar_historial_sesion(id_usuario_valido);
    limpiar_historial_sesion(id_usuario_malicioso);
  });

  // limpieza posterior al finalizar la ejecucion total de la suite
  afterAll(() => {
    limpiar_historial_sesion(id_usuario_valido);
    limpiar_historial_sesion(id_usuario_malicioso);
  });

  // prueba unitaria de sanitizacion contra path traversal (OWASP A03:2026)
  test('debe sanitizar caracteres peligrosos de inyeccion de rutas', () => {
    const id_sanitizado = sanitizar_identificador_usuario(id_usuario_malicioso);

    expect(id_sanitizado).not.toContain('..');

    expect(id_sanitizado).not.toContain('/');

  });

  // prueba de integracion para guardar y recuperar el historial completo
  test('debe guardar y posteriormente cargar el historial de mensajes correctamente', () => {
    const historial_simulado = [
      { rol: 'user', texto: 'Hola, ¿qué planes tienen?' },
      { rol: 'model', texto: 'Tenemos el Plan Recomendado por 400 €.' }
    ];

    const guardado_exitoso = guardar_historial_sesion(id_usuario_valido, historial_simulado, 'CLIENTE');

    expect(guardado_exitoso).toBe(true);

    const sesion_recuperada = cargar_historial_sesion(id_usuario_valido);

    expect(sesion_recuperada.historial.length).toBe(2);

    expect(sesion_recuperada.historial[0].texto).toBe('Hola, ¿qué planes tienen?');

  });

  // prueba de eliminacion segura de archivos de sesion en disco
  test('debe eliminar la sesion en disco de forma segura', () => {
    const resultado_limpieza = limpiar_historial_sesion(id_usuario_valido);

    expect(resultado_limpieza).toBe(true);

    const sesion_post_limpieza = cargar_historial_sesion(id_usuario_valido);

    expect(sesion_post_limpieza.historial).toEqual([]);

  });

});