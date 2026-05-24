import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const bus = await prisma.bus.findUnique({
      where: { id }
    })

    if (!bus) {
      return NextResponse.json(
        { error: 'Bus no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(bus)
  } catch (error) {
    console.error('Error al obtener bus:', error)
    return NextResponse.json(
      { error: 'Error al obtener el bus' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { numero, placa, chasis, carroceria, marca, capacidad, asientosVIP, asientosVIPNumeros, fotoUrl } = body
    const { id } = await params

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
        asientosVIPNumeros: asientosVIPNumeros || '',
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current bus to toggle status
    const currentBus = await prisma.bus.findUnique({
      where: { id }
    })

    if (!currentBus) {
      return NextResponse.json(
        { error: 'Bus no encontrado' },
        { status: 404 }
      )
    }

    const bus = await prisma.bus.update({
      where: { id },
      data: { activo: !currentBus.activo }
    })

    const action = bus.activo ? 'activado' : 'desactivado'
    return NextResponse.json({ 
      message: `Bus ${action} correctamente`,
      bus 
    })
  } catch (error) {
    console.error('Error al cambiar estado del bus:', error)
    return NextResponse.json(
      { error: 'Error al cambiar estado del bus' },
      { status: 500 }
    )
  }
}
