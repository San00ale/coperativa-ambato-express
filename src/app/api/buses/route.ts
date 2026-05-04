import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const buses = await prisma.bus.findMany({
      where: { activo: true },
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
    const { numero, placa, chasis, carroceria, marca, capacidad, asientosVIP, fotoUrl } = body
    
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
        fotoUrl: fotoUrl || null,
        activo: true
      }
    })
    return NextResponse.json(bus, { status: 201 })
  } catch (error) {
    console.error('Error al crear bus:', error)
    return NextResponse.json(
      { error: 'Error al crear el bus' },
      { status: 500 }
    )
  }
}