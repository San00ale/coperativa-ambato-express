import type { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const ruta = await prisma.ruta.findUnique({
      where: { id },
      include: {
        frecuencia: true,
        bus: true,
        boletos: {
          where: {
            estado: { in: ['APROBADO', 'PENDIENTE_APROBACION', 'ABORDADO'] }
          },
          select: {
            asiento: true,
            estado: true
          }
        }
      }
    })

    if (!ruta) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 })
    }

    return NextResponse.json(ruta)
  } catch (error) {
    console.error('Error al obtener ruta:', error)
    return NextResponse.json({ error: 'Error al obtener la ruta' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    // Permitir ADMIN y CHOFER (chofer solo puede marcar completada)
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'CHOFER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { busId, fecha, estado, completada } = body

    // Si es chofer, solo permitir cambiar completada (no otros campos)
    if (session?.user?.role === 'CHOFER') {
      if (busId !== undefined || fecha !== undefined) {
        return NextResponse.json(
          { error: 'Los choferes solo pueden marcar la ruta como completada' },
          { status: 403 }
        )
      }
    }

    const updateData: Prisma.RutaUpdateInput = {}
    if (busId !== undefined) updateData.busId = busId
    if (fecha !== undefined) updateData.fecha = new Date(fecha)
    if (estado !== undefined) updateData.estado = estado
    if (completada !== undefined) updateData.completada = completada
    if (completada === true && estado === undefined) {
      updateData.estado = 'completada'
    }

    const ruta = await prisma.ruta.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(ruta)
  } catch (error) {
    console.error('Error al actualizar ruta:', error)
    return NextResponse.json({ error: 'Error al actualizar la ruta' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const ruta = await prisma.ruta.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Ruta eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar ruta:', error)
    return NextResponse.json({ error: 'Error al eliminar la ruta' }, { status: 500 })
  }
}