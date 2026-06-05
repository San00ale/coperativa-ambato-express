import type { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await context.params

    const ruta = await prisma.ruta.findUnique({
      where: { id },
      include: {
        frecuencia: {
          include: {
            paradas: { orderBy: { orden: 'asc' } }
          }
        },
        bus: true,
        boletos: {
          where: {
            estado: { in: ['APROBADO', 'PENDIENTE_APROBACION', 'ABORDADO'] }
          },
          select: { asiento: true, estado: true }
        },
        chofer: {
          select: { id: true, nombre: true, email: true }
        },
        registrosParada: {
          include: { parada: true },
          orderBy: { llegada: 'asc' }
        }
      }
    })

    if (!ruta) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 })
    }

    if (session.user?.role === 'CHOFER' && ruta.choferId !== session.user.id) {
      return NextResponse.json({ error: 'No tienes acceso a esta ruta' }, { status: 403 })
    }

    return NextResponse.json(ruta)
  } catch (error) {
    console.error('Error al obtener ruta:', error)
    return NextResponse.json({ error: 'Error al obtener la ruta' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (
      session?.user?.role !== 'ADMIN' &&
      session?.user?.role !== 'CHOFER' &&
      session?.user?.role !== 'OFICINISTA'
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { busId, fecha, estado, completada, inicio } = body

    // El chofer solo puede cambiar estado/completada/inicio
    if (session.user?.role === 'CHOFER') {
      if (busId !== undefined || fecha !== undefined) {
        return NextResponse.json(
          { error: 'Los choferes solo pueden actualizar el estado del viaje' },
          { status: 403 }
        )
      }
    }

    const rutaActual = await prisma.ruta.findUnique({ where: { id } })

    if (!rutaActual) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 })
    }

    if (session.user?.role === 'CHOFER' && rutaActual.choferId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar esta ruta' },
        { status: 403 }
      )
    }

    if (rutaActual.estado === 'completada') {
      return NextResponse.json(
        { error: 'No puedes modificar una ruta que ya está completada' },
        { status: 400 }
      )
    }

    const updateData: Prisma.RutaUpdateInput = {}

    if (busId !== undefined) updateData.bus = { connect: { id: busId } }
    if (fecha !== undefined) updateData.fecha = new Date(fecha)
    if (estado !== undefined) updateData.estado = estado
    if (completada !== undefined) updateData.completada = completada
    if (inicio !== undefined) updateData.inicio = new Date(inicio)

    if (completada === true && estado === undefined) {
      updateData.estado = 'completada'
    }

    if (estado === 'en_curso' && inicio === undefined) {
      updateData.inicio = new Date()
    }

    const ruta = await prisma.ruta.update({
      where: { id },
      data: updateData,
      include: {
        frecuencia: {
          include: {
            paradas: { orderBy: { orden: 'asc' } }
          }
        },
        bus: true,
        registrosParada: {
          include: { parada: true },
          orderBy: { llegada: 'asc' }
        }
      }
    })

    return NextResponse.json(ruta)
  } catch (error) {
    console.error('Error al actualizar ruta:', error)
    return NextResponse.json({ error: 'Error al actualizar la ruta' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await context.params

    await prisma.ruta.delete({ where: { id } })

    return NextResponse.json({ message: 'Ruta eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar ruta:', error)
    return NextResponse.json({ error: 'Error al eliminar la ruta' }, { status: 500 })
  }
}