import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const buses = await prisma.bus.findMany({
      orderBy: { numero: 'asc' }
    })
    return NextResponse.json(buses)
  } catch (error) {
    console.error('Error al obtener buses:', error)
    return NextResponse.json(
      { error: 'Error al obtener la lista de buses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { numero, placa, chasis, carroceria, marca, capacidad, asientosVIP, asientosVIPNumeros, fotoUrl } = body
    
    if (!numero || !placa || !capacidad) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: numero, placa, capacidad' },
        { status: 400 }
      )
    }
    
    const bus = await prisma.bus.create({
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
        activo: true
      }
    })
    return NextResponse.json(bus, { status: 201 })
  } catch (error) {
    console.error('Error al crear bus:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        if (error.message.includes('numero')) {
          return NextResponse.json(
            { error: 'El número de bus ya existe' },
            { status: 400 }
          )
        }
        if (error.message.includes('placa')) {
          return NextResponse.json(
            { error: 'La placa ya existe' },
            { status: 400 }
          )
        }
      }
    }
    
    return NextResponse.json(
      { error: 'Error al crear el bus' },
      { status: 500 }
    )
  }
}