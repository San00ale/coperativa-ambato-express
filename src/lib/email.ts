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
      html: `