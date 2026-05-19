import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'OFICINISTA' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const boleto = await prisma.boleto.findUnique({
      where: { id },
      include: { pasajero: true, ruta: true }
    })

    if (!boleto) {
      return NextResponse.json({ error: 'Boleto no encontrado' }, { status: 404 })
    }

    if (boleto.estado !== 'PENDIENTE_APROBACION') {
      return NextResponse.json({ error: 'Este boleto ya fue procesado' }, { status: 400 })
    }

    // Cambiar estado a CANCELADO (asiento liberado)
    await prisma.boleto.update({
      where: { id },
      data: { estado: 'CANCELADO' }
    })

    return NextResponse.json({ message: 'Pago rechazado, asiento liberado' })
  } catch (error) {
    console.error('Error al rechazar pago:', error)
    return NextResponse.json({ error: 'Error al rechazar el pago' }, { status: 500 })
  }
}