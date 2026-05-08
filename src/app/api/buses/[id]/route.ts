import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { numero, placa, chasis, carroceria, marca, capacidad, asientosVIP, fotoUrl } = body
    const { id } = params

    if (!numero || !placa || !capacidad) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: numero, placa, capacidad' },
        { status: 400 }
      )
    }

    const bus = await prisma.bus.update({
      where: { id },
      data: {
        numero,
        placa,
        chasis: chasis || '',
        carroceria: carroceria || '',
        marca: marca || '',
        capacidad: parseInt(capacidad),
        asientosVIP: asientosVIP ? parseInt(asientosVIP) : 0,
        fotoUrl: fotoUrl || null,
      }
    })

    return NextResponse.json(bus)
  } catch (error) {
    console.error('Error al actualizar bus:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el bus' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const bus = await prisma.bus.update({
      where: { id },
      data: { activo: false }
    })

    return NextResponse.json({ message: 'Bus eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar bus:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el bus' },
      { status: 500 }
    )
  }
}
