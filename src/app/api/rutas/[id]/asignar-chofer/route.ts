import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/rutas/[id]/asignar-chofer
 * Asigna o desasigna un chofer a una ruta
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que es ADMIN
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden asignar choferes' },
        { status: 403 }
      )
    }

    const { choferId } = await request.json()
    const rutaId = params.id

    if (!rutaId) {
      return NextResponse.json(
        { error: 'ID de ruta requerido' },
        { status: 400 }
      )
    }

    // Validar que la ruta existe
    const ruta = await prisma.ruta.findUnique({
      where: { id: rutaId }
    })

    if (!ruta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      )
    }

    // Si choferId es null, desasignar. Si es string, asignar.
    if (!choferId) {
      // Desasignar
      const rutaActualizada = await prisma.ruta.update({
        where: { id: rutaId },
        data: { choferId: null },
        include: {
          chofer: {
            select: {
              nombre: true,
              email: true
            }
          }
        }
      })

      return NextResponse.json({
        message: 'Chofer desasignado',
        ruta: rutaActualizada
      })
    }

    // Validar que el chofer existe y es CHOFER
    const chofer = await prisma.usuario.findUnique({
      where: { id: choferId }
    })

    if (!chofer || chofer.rol !== 'CHOFER') {
      return NextResponse.json(
        { error: 'Chofer no válido' },
        { status: 400 }
      )
    }

    // Asignar chofer a ruta
    const rutaActualizada = await prisma.ruta.update({
      where: { id: rutaId },
      data: { choferId },
      include: {
        frecuencia: true,
        bus: true,
        chofer: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Chofer asignado correctamente',
      ruta: rutaActualizada
    })
  } catch (error) {
    console.error('Error asignando chofer:', error)
    return NextResponse.json(
      { error: 'Error al asignar el chofer' },
      { status: 500 }
    )
  }
}