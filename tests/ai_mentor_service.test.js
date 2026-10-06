// declaracion de la funcion simulada precedida por el prefijo mock para permitir hoisting en jest
const mock_generate_content = jest.fn();

// mockeo modular explicito del sdk oficial de google genai (edicion 2026)
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: mock_generate_content
        }
      };
    })
  };
});

// importacion de las funciones del servicio de ia tras configurar el mock
const { generar_respuesta_jonathan } = require('../src/services/ai_mentor_service');

// suite de pruebas unitarias y de resiliencia para el servicio ai mentor
describe('Suite de Pruebas: src/services/ai_mentor_service.js', () => {

  // limpieza e inicializacion de mocks antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // prueba unitaria para validar la respuesta simulada en rol cliente
  test('debe retornar respuesta valida simulada para el rol CLIENTE', async () => {
    mock_generate_content.mockResolvedValueOnce({
      text: 'Hola, te presento el Plan Recomendado de 400 €.'
    });

    const respuesta = await generar_respuesta_jonathan('CLIENTE', true, [], '¿Qué planes tienen?');

    expect(respuesta).toBe('Hola, te presento el Plan Recomendado de 400 €.');

    expect(mock_generate_content).toHaveBeenCalledTimes(1);

  });

  // prueba unitaria para validar la respuesta con comisiones para el rol embajador
  test('debe retornar respuesta con detalles de comisiones para el rol EMBAJADOR', async () => {
    mock_generate_content.mockResolvedValueOnce({
      text: 'Como embajador ganas el 10% base y puedes duplicar al 20% si superas 5 ventas.'
    });

    const respuesta = await generar_respuesta_jonathan('EMBAJADOR', false, [], '¿Cuánto gano por venta?');

    expect(respuesta).toContain('10% base');

    expect(respuesta).toContain('20%');

  });

  // prueba de resiliencia y conmutacion de modelos (failover) ante error 503
  test('debe reintentar o cambiar de modelo si el primer intento devuelve error 503', async () => {
    mock_generate_content
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
      .mockResolvedValueOnce({
        text: 'Respuesta recuperada tras reintento.'
      });

    const respuesta = await generar_respuesta_jonathan('CLIENTE', false, [], 'Hola');

    expect(respuesta).toBe('Respuesta recuperada tras reintento.');

    expect(mock_generate_content).toHaveBeenCalledTimes(2);

  });

});