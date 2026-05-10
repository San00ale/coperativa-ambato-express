import { Resend } from 'resend'

// Solo inicializar Resend si la API key está presente (evita error en CI)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function enviarCorreoQR(
  emailDestino: string,
  nombrePasajero: string,
  qrUrl: string,
  ruta: string,
  fecha: string,
  asiento: string
) {
  // Si no hay cliente de Resend (por ejemplo, en CI), solo logueamos y devolvemos éxito simulado
  if (!resend) {
    console.log('🔧 [CI MODE] Resend no configurado. Correo no enviado realmente.')
    return { success: true, data: null }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: emailDestino,
      subject: 'Tu boleto de Cooperativa Ambato Express',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a8a;">Cooperativa Ambato Express</h1>
          <h2>¡Tu boleto ha sido aprobado!</h2>
          
          <p>Hola <strong>${nombrePasajero}</strong>,</p>
          
          <p>Tu pago ha sido confirmado. Aquí están los detalles de tu viaje:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
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
          
          <p><strong>Tu código QR para abordar:</strong></p>
          <img src="${qrUrl}" alt="QR del boleto" style="border: 1px solid #ddd; padding: 10px; width: 200px;"/>
          
          <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
            Presenta este QR al chofer al momento de abordar.
          </p>
          
          <hr />
          
          <p style="font-size: 12px; color: #6b7280;">
            Cooperativa Ambato Express - Transporte seguro y confiable
          </p>
        </div>
      `
    })

    if (error) {
      console.error('Error al enviar correo:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error al enviar correo:', error)
    return { success: false, error }
  }
}