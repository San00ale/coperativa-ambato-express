import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import QRCode from 'qrcode'
import { enviarCorreoQR } from '@/lib/email'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'OFICINISTA' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params

    const boleto = await prisma.boleto.findUnique({
      where: { id },
      include: {
        ruta: {
          include: {
            frecuencia: true,
            bus: true
          }
        },
        pasajero: true
      }
    })

    if (!boleto) {
      return NextResponse.json({ error: 'Boleto no encontrado' }, { status: 404 })
    }

    if (boleto.estado !== 'PENDIENTE_APROBACION') {
      return NextResponse.json({ error: 'Este boleto ya fue procesado' }, { status: 400 })
    }

    const qrData = JSON.stringify({
      boletoId: boleto.id,
      ruta: `${boleto.ruta.frecuencia.origen} → ${boleto.ruta.frecuencia.destino}`,
      fecha: boleto.ruta.fecha,
      hora: boleto.ruta.frecuencia.hora,
      asiento: boleto.asiento,
      pasajero: boleto.pasajero.nombre,
      cedula: boleto.pasajero.cedula
    })

    const qrUrl = await QRCode.toDataURL(qrData)

    const boletoActualizado = await prisma.boleto.update({
      where: { id },
      data: {
        estado: 'APROBADO',
        qrUrl
      }
    })

    return NextResponse.json(boletoActualizado)
  } catch (error) {
    console.error('Error al aprobar boleto:', error)
    return NextResponse.json({ error: 'Error al aprobar el boleto' }, { status: 500 })
  }
}