// importacion del framework de pruebas y los modulos a testear
const path = require('path');
const fs = require('fs');

// importacion de las funciones exportadas de embajadores_config
const {
  cargar_lista_embajadores,
  extraer_solo_numeros,
  extraer_identificador_remitente,
  es_embajador_registrado
} = require('../config/embajadores_config');

// bloque principal de pruebas unitarias para el modulo de embajadores
describe('Suite de Pruebas: config/embajadores_config.js', () => {

  // prueba unitaria para verificacion de extraccion de digitos limpios
  test('debe extraer estrictamente solo digitos numericos de una cadena o JID', () => {
    const jid_con_formato = '34600112233@s.whatsapp.net';
    const lid_con_formato = '88399117562053@lid';
    const texto_con_simbolos = '+34 (600) 11-22-33';

    expect(extraer_solo_numeros(jid_con_formato)).toBe('34600112233');

    expect(extraer_solo_numeros(lid_con_formato)).toBe('88399117562053');

    expect(extraer_solo_numeros(texto_con_simbolos)).toBe('34600112233');

  });

  // prueba unitaria para la extraccion correcta del identificador desde el objeto del mensaje
  test('debe extraer el JID o LID correcto desde la estructura de clave de Baileys', () => {
    const estructura_mensaje_lid = {
      key: {
        remoteJidAlt: '88399117562053@lid',
        remoteJid: '120363000000000000@g.us'
      }
    };

    const estructura_mensaje_directo = {
      key: {
        remoteJid: '34600112233@s.whatsapp.net'
      }
    };

    expect(extraer_identificador_remitente(estructura_mensaje_lid)).toBe('88399117562053@lid');

    expect(extraer_identificador_remitente(estructura_mensaje_directo)).toBe('34600112233@s.whatsapp.net');

  });

  // prueba de integracion para validar la identificacion correcta de embajador
  test('debe retornar true si el remitente coincide con el teléfono o LID de la lista', () => {
    const objeto_mensaje_embajador = {
      key: {
        remoteJidAlt: '88399117562053@lid'
      }
    };

    const es_valido = es_embajador_registrado(objeto_mensaje_embajador);

    expect(es_valido).toBe(true);

  });

  // prueba de seguridad para rechazar usuarios no autorizados
  test('debe retornar false si el remitente es un cliente no registrado', () => {
    const objeto_mensaje_cliente = {
      key: {
        remoteJid: '34999888777@s.whatsapp.net'
      }
    };

    const es_valido = es_embajador_registrado(objeto_mensaje_cliente);

    expect(es_valido).toBe(false);

  });

});