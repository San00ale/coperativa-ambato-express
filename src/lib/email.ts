import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
export async function enviarCorreoQR(
  emailDestino: string,
  nombrePasajero: string,
  qrUrl: string,
  ruta: string,
  fecha: string,
  asiento: string
) {
  try {    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: emailDestino,
      subject: 'Tu boleto de Cooperativa Ambato Express',
      html: `        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a8a;">Cooperativa Ambato Express</h1>
          <h2>¡Tu boleto ha sido aprobado!</h2>
          
          <p>Hola <strong>${nombrePasajero}</strong>,</p>
          
          <p>Tu pago ha sido confirmado. Aquí están los detalles de tu viaje:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">            <tr>
              <td style="padding: 8px; background: #f3f4f6;"><strong>Ruta:</strong></td>
              <td style="padding: 8px;">${ruta}</td>
            </tr>
            <tr>
              <td style="padding: 8px; background: #f3f4f6;"><strong>Fecha:</strong></td>
              <td style="padding: 8px;">${new Date(fecha).toLocaleDateString('es-EC')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; background: #f3f4f6;"><strong>Asiento:</strong></td>
              <td style="padding: 8px;">${asiento}</td>
            </tr>
          </table>