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
  try {