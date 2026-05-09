import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {

    const body = await request.json()
    const { completada } = body

    if (completada === undefined) {
      return NextResponse.json(
        { error: 'Campo requerido: completada' },
        { status: 400 }
      )
    }

    const ruta = await prisma.ruta.update({
      where: { id },
      data: {
        completada,
      },
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

    return NextResponse.json({ok:true})
  } catch (error) {
    console.error('Error al actualizar ruta:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la ruta' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
const { id } = await context.params

  try {
    
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