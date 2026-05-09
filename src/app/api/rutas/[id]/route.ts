import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    
    const ruta = await prisma.ruta.findUnique({
      where: { id },
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
          where: { estado: 'APROBADO' }
        }
      }
    })
    
    if (!ruta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(ruta)
  } catch (error) {
    console.error('Error al obtener ruta:', error)
    return NextResponse.json(
      { error: 'Error al obtener la ruta' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { frecuenciaId, fecha, busId } = body
    
    if (!frecuenciaId || !fecha || !busId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: frecuenciaId, fecha, busId' },
        { status: 400 }
      )
    }
    
    // Verificar que la ruta existe
    const rutaExistente = await prisma.ruta.findUnique({
      where: { id }
    })
    
    if (!rutaExistente) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      )
    }
    
    const ruta = await prisma.ruta.update({
      where: { id },
      data: {
        frecuenciaId,
        fecha: new Date(fecha),
        busId
      },
      include: {
        frecuencia: true,
        bus: true
      }
    })
    
    return NextResponse.json(ruta)
  } catch (error) {
    console.error('Error al actualizar ruta:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la ruta' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    
    // Verificar que la ruta existe
    const rutaExistente = await prisma.ruta.findUnique({
      where: { id },
      include: {
        boletos: true
      }
    })
    
    if (!rutaExistente) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      )
    }
    
    // Verificar que no haya boletos asociados
    if (rutaExistente.boletos.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la ruta porque tiene boletos asociados' },
        { status: 400 }
      )
    }
    
    await prisma.ruta.delete({
      where: { id }
    })
    
    return NextResponse.json(
      { message: 'Ruta eliminada correctamente' }
    )
  } catch (error) {
    console.error('Error al eliminar ruta:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la ruta' },
      { status: 500 }
    )
  }
}
