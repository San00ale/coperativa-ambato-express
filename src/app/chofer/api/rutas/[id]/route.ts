import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * PUT /api/rutas/[id]
 * Actualiza el estado e inicio de una ruta
 * 
 * ⚠️ PROTECCIONES:
 * - Una ruta COMPLETADA no puede ser modificada
 * - No se puede reiniciar una ruta ya completada
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const rutaId = params.id

    if (!rutaId) {
      return NextResponse.json(
        { error: 'ID de ruta requerido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { estado, inicio, completada } = body

    console.log(`[PUT /api/rutas/${rutaId}] Actualizando con:`, { estado, inicio, completada })

    // Obtener ruta actual
    const ruta = await prisma.ruta.findUnique({
      where: { id: rutaId }
    })

    if (!ruta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      )
    }

    // Validar permisos
    if (session.user?.role === 'CHOFER' && ruta.choferId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para actualizar esta ruta' },
        { status: 403 }
      )
    }

    // ← PROTECCIÓN: No permitir cambios en rutas completadas
    if (ruta.estado === 'completada') {
      return NextResponse.json(
        { 
          error: 'No puedes modificar una ruta que ya está completada. El viaje ha finalizado.' 
        },
        { status: 400 }
      )
    }

    // ← PROTECCIÓN: No permitir reiniciar viaje completado
    if (ruta.completada === true && estado === 'en_curso') {
      return NextResponse.json(
        { 
          error: 'No puedes reiniciar un viaje que ya ha sido completado.' 
        },
        { status: 400 }
      )
    }

    // Preparar datos a actualizar
    const updateData: any = {}
    
    if (estado) {
      // Validar estados válidos
      const estadosValidos = ['pendiente', 'en_curso', 'completada']
      if (!estadosValidos.includes(estado)) {
        return NextResponse.json(
          { error: 'Estado inválido' },
          { status: 400 }
        )
      }
      updateData.estado = estado
    }
    
    if (inicio) {
      updateData.inicio = new Date(inicio)
    }
    
    if (completada !== undefined) {
      updateData.completada = completada
    }

    // Si se marca como completada, asegurar que estado también sea completada
    if (completada === true && !estado) {
      updateData.estado = 'completada'
    }

    // Si se inicia viaje, asegurar que haya timestamp de inicio
    if (estado === 'en_curso' && !updateData.inicio) {
      updateData.inicio = new Date()
    }

    console.log(`[PUT /api/rutas/${rutaId}] Datos a guardar:`, updateData)

    // Actualizar ruta
    const rutaActualizada = await prisma.ruta.update({
      where: { id: rutaId },
      data: updateData,
      include: {
        frecuencia: {
          include: {
            paradas: {
              orderBy: { orden: 'asc' }
            }
          }
        },
        bus: true,
        boletos: true,
        chofer: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    })

    console.log(`[PUT /api/rutas/${rutaId}] ✅ Actualizada exitosamente`)

    return NextResponse.json(rutaActualizada, { status: 200 })
  } catch (error) {
    console.error(`Error al actualizar ruta:`, error)
    return NextResponse.json(
      { error: 'Error al actualizar la ruta' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/rutas/[id]
 * Obtiene información detallada de una ruta
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const rutaId = params.id

    const ruta = await prisma.ruta.findUnique({
      where: { id: rutaId },
      include: {
        frecuencia: {
          include: {
            paradas: {
              orderBy: { orden: 'asc' }
            }
          }
        },
        bus: true,
        boletos: {
          include: {
            pasajero: {
              select: {
                nombre: true,
                cedula: true
              }
            }
          }
        },
        chofer: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    })

    if (!ruta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      )
    }

    // Si es chofer, validar que sea su ruta
    if (session.user?.role === 'CHOFER' && ruta.choferId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta ruta' },
        { status: 403 }
      )
    }

    return NextResponse.json(ruta, { status: 200 })
  } catch (error) {
    console.error('Error al obtener ruta:', error)
    return NextResponse.json(
      { error: 'Error al obtener la ruta' },
      { status: 500 }
    )
  }
}