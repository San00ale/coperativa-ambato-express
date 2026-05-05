import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'OFICINISTA' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const boletos = await prisma.boleto.findMany({
      where: {
        estado: 'PENDIENTE_APROBACION',
        metodoPago: 'TRANSFERENCIA'
      },
      include: {
        ruta: {
          include: {
            frecuencia: true,
            bus: true
          }
        },
        pasajero: {
          select: { nombre: true, cedula: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(boletos)
  } catch (error) {
    console.error('Error al obtener pagos pendientes:', error)
    return NextResponse.json({ error: 'Error al obtener pagos pendientes' }, { status: 500 })
  }
}