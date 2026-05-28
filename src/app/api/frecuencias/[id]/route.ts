import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT /api/frecuencias/[id] - Actualizar una frecuencia
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { origen, destino, hora, tipoViaje, activa, duracion } = body

    if (!origen || !destino || !hora) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: origen, destino, hora' },
        { status: 400 }
      )
    }

    const frecuencia = await prisma.frecuencia.update({
      where: { id },
      data: {
        origen,
        destino,
        hora,
        tipoViaje: tipoViaje || 'DIRECTO',
        activa: activa !== undefined ? activa : true,
        duracion: duracion ? parseInt(duracion) : null
      }
    })

    return NextResponse.json(frecuencia)
  } catch (error) {
    console.error('Error al actualizar frecuencia:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la frecuencia' },
      { status: 500 }
    )
  }
}

// DELETE /api/frecuencias/[id] - Eliminar una frecuencia (soft delete)
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

    // Verificar si la frecuencia tiene rutas asociadas
    const rutasAsociadas = await prisma.ruta.count({
      where: { frecuenciaId: id }
    })

    if (rutasAsociadas > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la frecuencia porque tiene rutas asociadas' },
        { status: 409 }
      )
    }

    await prisma.frecuencia.update({
      where: { id },
      data: { activa: false }
    })

    return NextResponse.json({ message: 'Frecuencia eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar frecuencia:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la frecuencia' },
      { status: 500 }
    )
  }
}