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
    const { origen, destino, hora, tipoViaje, activa, duracion, precioBase, preciosPorTramo } = body

    if (!origen || !destino || !hora) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: origen, destino, hora' },
        { status: 400 }
      )
    }

    // Validación origen != destino
    if (origen.trim().toLowerCase() === destino.trim().toLowerCase()) {
      return NextResponse.json(
        { error: 'El origen y el destino no pueden ser la misma ciudad' },
        { status: 400 }
      )
    }

    // Validación duración
    if (duracion !== undefined && duracion !== null) {
      const duracionNum = parseInt(duracion)
      if (isNaN(duracionNum) || duracionNum < 1 || duracionNum > 720) {
        return NextResponse.json(
          { error: 'La duración debe ser un número entre 1 y 720 minutos' },
          { status: 400 }
        )
      }
    }

    // Validar precioBase para viajes directos
    const tipoViajeFinal = tipoViaje || 'DIRECTO'
    if (tipoViajeFinal === 'DIRECTO' && (!precioBase || precioBase <= 0)) {
      return NextResponse.json(
        { error: 'El precio base es obligatorio para viajes directos y debe ser mayor a 0' },
        { status: 400 }
      )
    }

    const frecuencia = await prisma.frecuencia.update({
      where: { id },
      data: {
        origen,
        destino,
        hora,
        tipoViaje: tipoViajeFinal,
        activa: activa !== undefined ? activa : true,
        duracion: duracion ? parseInt(duracion) : null,
        precioBase: precioBase ? parseFloat(precioBase) : null,
        preciosPorTramo: preciosPorTramo ? JSON.stringify(preciosPorTramo) : null
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