import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/boletos/mis-compras - Obtener el historial de compras del cliente
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CLIENTE') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const boletos = await prisma.boleto.findMany({
      where: { pasajeroId: session.user.id },
      include: {
        ruta: {
          include: {
            frecuencia: true,
            bus: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(boletos)
  } catch (error) {
    console.error('Error al obtener historial:', error)
    return NextResponse.json({ error: 'Error al obtener el historial' }, { status: 500 })
  }
}