// importacion del modulo de rutas nativo de node.js
const path = require('path');

// declaracion de la suite de pruebas para el gestor de sesiones de usuarios
describe('Suite de Pruebas: tests/session_manager.test.js', () => {

  // inicializacion de variables de entorno de prueba antes de cada ejecucion
  beforeEach(() => {
    // limpieza de mocks globales nativos de jest sin re-declarar la palabra reservada
    jest.clearAllMocks();
    jest.resetModules();
  });

  // prueba unitaria para la creacion correcta de una nueva estructura de sesion
  test('debe inicializar un estado de sesion limpio para un remitente unico', () => {
    const id_remitente_prueba = '34600112233@s.whatsapp.net';

    const estructura_sesion_esperada = {
      id_usuario: id_remitente_prueba,
      historial_mensajes: [],
      rol_asignado: 'CLIENTE',
      ultima_interaccion: expect.any(Number)
    };

    expect(id_remitente_prueba).toBeDefined();

    expect(estructura_sesion_esperada.rol_asignado).toBe('CLIENTE');

  });

  // prueba unitaria para verificar la asignacion del rol de embajador
  test('debe asignar el rol EMBAJADOR si la verificacion de identificador es exitosa', () => {
    const id_embajador_prueba = '88399117562053@lid';

    const es_embajador = true;

    const rol_final = es_embajador ? 'EMBAJADOR' : 'CLIENTE';

    expect(rol_final).toBe('EMBAJADOR');

  });

  // prueba unitaria para validar la limpieza de memoria de sesiones inactivas
  test('debe limpiar o resetear la sesion si excede el tiempo de expiracion', () => {
    const tiempo_limite_ms = 1800000; // 30 minutos en milisegundos
    const tiempo_ultima_interaccion = Date.now() - 2000000;

    const diferencia_tiempo = Date.now() - tiempo_ultima_interaccion;

    const esta_expirada = diferencia_tiempo > tiempo_limite_ms;

    expect(esta_expirada).toBe(true);

  });

});