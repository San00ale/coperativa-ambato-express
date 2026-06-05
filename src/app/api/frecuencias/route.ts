import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const frecuencias = await prisma.frecuencia.findMany({
      where: { activa: true },
      include: {
        paradas: {
          orderBy: { orden: 'asc' }
        }
      },
      orderBy: [{ origen: 'asc' }, { destino: 'asc' }, { hora: 'asc' }]
    })
    return NextResponse.json(frecuencias)
  } catch (error) {
    console.error('Error al obtener frecuencias:', error)
    return NextResponse.json(
      { error: 'Error al obtener la lista de frecuencias' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { origen, destino, hora, tipoViaje, paradas, duracion, precioBase, preciosPorTramo } = body
    
    if (!origen || !destino || !hora) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: origen, destino, hora' },
        { status: 400 }
      )
    }

    // Validar precioBase para viajes directos
    const tipoViajeFinal = tipoViaje || 'DIRECTO'
    if (tipoViajeFinal === 'DIRECTO' && (!precioBase || precioBase <= 0)) {
      return NextResponse.json(
        { error: 'El precio base es obligatorio para viajes directos y debe ser mayor a 0' },
        { status: 400 }
      )
    }
    
    const frecuencia = await prisma.frecuencia.create({
      data: {
        origen,
        destino,
        hora,
        duracion: duracion ? parseInt(duracion) : null,
        tipoViaje: tipoViajeFinal,
        activa: true,
        precioBase: precioBase ? parseFloat(precioBase) : null,
        preciosPorTramo: preciosPorTramo ? JSON.stringify(preciosPorTramo) : null,
        paradas: paradas && paradas.length > 0 ? {
          create: paradas.map((ciudad: string, index: number) => ({
            ciudad,
            orden: index + 1
          }))
        } : undefined
      },
      include: {
        paradas: true
      }
    })
    return NextResponse.json(frecuencia, { status: 201 })
  } catch (error) {
    console.error('Error al crear frecuencia:', error)
    return NextResponse.json(
      { error: 'Error al crear la frecuencia' },
      { status: 500 }
    )
  }
}