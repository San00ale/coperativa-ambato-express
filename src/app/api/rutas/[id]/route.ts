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
          where: { estado: 'APROBADO' }
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
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { busId, fecha, completada } = body

    const ruta = await prisma.ruta.update({
      where: { id },
      data: {
        busId,
        fecha: fecha ? new Date(fecha) : undefined,
        completada
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
