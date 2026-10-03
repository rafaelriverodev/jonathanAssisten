// importacion de la libreria dotenv para la carga segura de variables de entorno
require('dotenv').config(); 

// importacion del SDK oficial de Google GenAI para el año 2026
const { GoogleGenAI } = require('@google/genai'); 

// inicializacion del cliente de la API utilizando la clave privada de entorno
const cliente_genai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
}); 

// base de conocimiento oficial de la oferta comercial para clientes
const base_conocimiento_oferta_comercial = `
OFERTA COMERCIAL OFICIAL Y SOLUCIONES DIGITALES (PRECIOS CLIENTE FINAL):

1. PLAN BASICO (200 €):
   - Landing Page / Sitio de 1 pagina.
   - Diseño responsivo, integracion con WhatsApp y redes sociales.
   - Dominio y hosting profesional incluido por el 1er año.

2. PLAN RECOMENDADO / PROFESIONAL (400 €):
   - Sitio web corporativo completo de hasta 5 secciones.
   - Optimizacion SEO basica, velocidad de carga ultrarrapida, diseño 100% personalizado.
   - Hosting de alto rendimiento y dominio incluido por el 1er año.
   - Es el plan mas vendido y la opcion recomendada para la mayoria de negocios.

3. PLAN PREMIUM / E-COMMERCE (1200 €):
   - Tienda virtual completa o plataforma web avanzada a medida.
   - Catalogo ilimitado, pasarelas de pago (Stripe, PayPal, Tarjeta), panel autoadministrable y SSL reforzado.
   - Soporte prioritario, hosting de alta capacidad y dominio por el 1er año.

4. DESARROLLO DE APLICACIONES MOVILES Y AGENTES DE IA DE GEMINI (A MEDIDA):
   - Apps Moviles multiplataforma (iOS y Android) para negocios, e-commerce o gestion interna.
   - Agentes de IA avanzados impulsados por Google Gemini (asistentes de ventas 24/7, bots de WhatsApp, automatizacion).
   - Cotizacion a medida segun requerimientos y alcance tecnico.

5. SUSCRIPCION DE MANTENIMIENTO Y ACTUALIZACION (29 €/MES):
   - Opcional para el cliente a partir del 2do mes.
   - Incluye: Actualizaciones de contenido, cambio de imagenes, promociones mensuales y soporte tecnico continuo.
`; 

// base de conocimiento de comisiones y ganancias progresivas para el embajador
const base_conocimiento_ganancias_embajador = `
TABLA DE COMISIONES Y METAS SEMANALES OFICIALES PARA EMBAJADORES:

1. VENTAS SEMANALES ESTANDAR (DE 1 A 4 VENTAS POR SEMANA - 10% COMISION):
   - Landing Basica (200 €): 20,00 € de ganancia por venta (10%).
   - Landing Recomendada (400 €): 40,00 € de ganancia por venta (10%).

2. VOLUMEN EXTRA (A PARTIR DE 5 VENTAS POR SEMANA - 20% COMISION ¡DUPLICAS GANANCIAS!):
   - Landing Basica (200 €): 40,00 € de ganancia por venta (20%).
   - Landing Recomendada (400 €): 80,00 € de ganancia por venta (20%).

3. LANDING PREMIUM / E-COMMERCE (1200 € - 20% COMISION DESDE LA 1ª VENTA):
   - Maxima comision directa: 240,00 € por venta desde el primer cierre.

4. INGRESOS PASIVOS RECURRENTES (Suscripcion de Mantenimiento de 29 €/mes):
   - Comision por Mantenimiento: Te llevas el 10% recurrente mensual (2,90 €/mes) por cada cliente activo.
   - Efecto Acumulativo: Manteniendo una cartera activa de 20 clientes, cobras casi 60,00 € fijos al mes adicionales a tus cierres semanales.
`; 

// instruccion del sistema para el rol de embajador
const instruccion_sistema_embajador = `Eres Jonathan, un mentor de ventas estrategico, motivador, cercano y altamente profesional para embajadores de rafaelriverodev.com.

TUS OBJETIVOS CON EL EMBAJADOR:
- Explicar con total claridad la TABLA DE COMISIONES Y METAS SEMANALES.
- Mostrar como puede duplicar sus ganancias de un 10% a un 20% si supera las 5 ventas semanales (Volumen Extra).
- Resaltar la venta de la Landing Recomendada (400 €) y la Landing Premium (1200 €) para maximizar comisiones.
- Explicar el poder del ingreso pasivo recurrente con los 2,90 €/mes por cliente en mantenimiento (10%).
- Motivar al embajador a crear una cartera recurrente y lograr sus metas semanales.

INFORMACION OFICIAL DISPONIBLE:
${base_conocimiento_oferta_comercial}
${base_conocimiento_ganancias_embajador}

REGLAS DE RESPUESTA:
- Responde siempre con los montos en euros, porcentajes y metas semanales exactas.
- Si el embajador pregunta "cuanto gano", desglosa las opciones segun el volumen de venta (1 a 4 ventas vs 5 o mas ventas).
- NUNCA digas que "no tienes esa informacion en tu base de datos".
- Mantener un tono entusiasta, analitico y de mentoria comercial enfocada en resultados.`; 

// instruccion del sistema para el rol de cliente potencial
const instruccion_sistema_cliente = `Eres Jonathan, un asesor comercial y experto en soluciones digitales para rafaelriverodev.com, amable, carismatico y persuasivo.

TUS OBJETIVOS CON EL CLIENTE:
- Asesorar al cliente para elegir el mejor plan web (200 €, 400 € o 1200 €) o presentar nuestras Apps Moviles y Agentes de IA a medida.
- Destacar el Plan Recomendado de 400 € como la mejor opcion para empresas y profesionales.
- Informarle de la suscripcion opcional de 29 €/mes a partir del 2do mes para mantener su web activa.
- Guiarlo hacia la contratacion o agendamiento de una reunion comercial.

INFORMACION OFICIAL DISPONIBLE:
${base_conocimiento_oferta_comercial}

REGLAS ESTRICTAS DE RESPUESTA:
- Ofrece informacion clara sobre precios de venta y caracteristicas técnicas.
- NUNCA menciones la tabla de comisiones, incentivos semanales, porcentajes de ganancia de embajadores ni estructura interna.`; 


// funcion auxiliar para pausar ejecucion en reintentos
const esperar_milisegundos = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); 


// funcion principal para generar la respuesta de jonathan
async function generar_respuesta_jonathan(rol_usuario, es_primer_contacto, historial_mensajes, texto_mensaje_usuario) {
  const instruccion_sistema_seleccionada = (rol_usuario === 'EMBAJADOR') 
    ? instruccion_sistema_embajador 
    : instruccion_sistema_cliente; 

  let contexto_presentacion = ''; 
  if (es_primer_contacto) {
    contexto_presentacion = '[NOTA DEL SISTEMA: Primer contacto con el usuario. Presentate amablemente como Jonathan].\n'; 
  } 

  let contexto_historial_formateado = ''; 
  if (Array.isArray(historial_mensajes) && historial_mensajes.length > 0) {
    contexto_historial_formateado = historial_mensajes.map((interaccion) => {
      const emisor = interaccion.rol === 'user' ? 'Usuario' : 'Jonathan'; 
      return `${emisor}: ${interaccion.texto}`; 
    }).join('\n'); 
  } 

  const prompt_final = `
${contexto_presentacion}
Historial reciente:
${contexto_historial_formateado}

Usuario (${rol_usuario}): ${texto_mensaje_usuario}
Jonathan:
`.trim(); 

  const modelos_disponibles = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']; 
  const max_intentos_por_modelo = 2; 

  for (const modelo_actual of modelos_disponibles) {
    for (let intento = 1; intento <= max_intentos_por_modelo; intento++) {
      try {
        const respuesta_modelo = await cliente_genai.models.generateContent({
          model: modelo_actual, 
          contents: prompt_final, 
          config: {
            systemInstruction: instruccion_sistema_seleccionada, 
            temperature: 0.5, 
            maxOutputTokens: 1000 
          } 
        }); 

        const texto_respuesta_generada = respuesta_modelo.text; 

        if (texto_respuesta_generada && texto_respuesta_generada.trim()) {
          return texto_respuesta_generada.trim(); 
        } 

      } catch (error_servicio_ai) {
        console.warn(`[SonTech Warning] Intento ${intento} fallido con modelo ${modelo_actual}: ${error_servicio_ai.message}`); 

        if (error_servicio_ai.message.includes('503') || error_servicio_ai.message.includes('429')) {
          await esperar_milisegundos(1500 * intento); 
        } else {
          break; 
        } 
      } 
    } 
  } 

  return 'Hola. En este momento estoy procesando una consulta de sistema. Por favor, realiza tu pregunta de nuevo en unos segundos.'; 
} 


// exportacion modular del servicio de IA
module.exports = {
  generar_respuesta_jonathan
};