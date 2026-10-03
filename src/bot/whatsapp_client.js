// importacion del modulo principal de baileys para la conexion con whatsapp
const makeWASocket = require('@whiskeysockets/baileys').default; 

// importacion de utilidades de autenticacion y estado de conexion de baileys
const { 
  useMultiFileAuthState, 
  DisconnectReason 
} = require('@whiskeysockets/baileys'); 

// importacion de la libreria para renderizar el codigo qr en la terminal
const qrcode_terminal = require('qrcode-terminal'); 

// importacion del modulo path para la resolucion segura de rutas en el sistema de archivos
const path = require('path'); 

// importacion del modulo pino para el registro seguro de logs estructurados
const pino = require('pino'); 

// definicion de la ruta absoluta para el almacenamiento seguro de credenciales de sesion
const ruta_carpeta_autenticacion = path.join(__dirname, '../../auth_info_baileys'); 


// funcion principal encargada de inicializar y conectar el cliente de whatsapp
async function conectar_cliente_whatsapp() {
  // inicializacion del estado de autenticacion guardado en disco
  const { state: estado_autenticacion, saveCreds: guardar_credenciales } = await useMultiFileAuthState(ruta_carpeta_autenticacion); 

  // creacion de la instancia del socket de baileys sin opciones deprecadas
  const instancia_socket_whatsapp = makeWASocket({
    auth: estado_autenticacion,
    logger: pino({ level: 'silent' }), 
    browser: ['Jonathan Assistant', 'Chrome', '1.0.0']
  }); 

  // evento para persistir las credenciales actualizadas cuando cambien
  instancia_socket_whatsapp.ev.on('creds.update', guardar_credenciales); 

  // gestion del evento de cambio en el estado de la conexion y renderizado de qr
  instancia_socket_whatsapp.ev.on('connection.update', (actualizacion_conexion) => {
    const { connection: estado_conexion, lastDisconnect: ultimo_descuelgue, qr: codigo_qr_generado } = actualizacion_conexion; 

    // si baileys emite un nuevo codigo qr, lo mostramos en la consola
    if (codigo_qr_generado) {
      console.log('\nEscanea el siguiente codigo QR con tu aplicacion de WhatsApp:\n'); 
      qrcode_terminal.generate(codigo_qr_generado, { small: true }); 
    }

    if (estado_conexion === 'close') {
      const codigo_motivo = ultimo_descuelgue?.error?.output?.statusCode; 
      const debe_reconectar = codigo_motivo !== DisconnectReason.loggedOut; 

      console.warn(`[SonTech Guard Log] Conexion cerrada. Motivo codigo: ${codigo_motivo}. Reconectando: ${debe_reconectar}`); 

      if (debe_reconectar) {
        // intento de reconexion automatica en caso de caida de red temporal
        conectar_cliente_whatsapp(); 
      } else {
        console.error('[SonTech Security Error] Sesion desvinculada o expirada (401). Elimina la carpeta auth_info_baileys y vuelve a iniciar.'); 
      }
    } else if (estado_conexion === 'open') {
      console.log('Conexion con el servicio de WhatsApp (Baileys) establecida y autenticada con exito.'); 
    }
  }); 

  return instancia_socket_whatsapp; 
} 


// exportacion modular estricta de la funcion de conexion
module.exports = {
  conectar_cliente_whatsapp
};