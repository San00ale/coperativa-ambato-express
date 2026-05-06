import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const paradas = await prisma.paradaFrecuencia.findMany({
      where: { frecuenciaId: id },
      orderBy: { orden: 'asc' }
    })

    return NextResponse.json(paradas)
  } catch (error) {
    console.error('Error al obtener paradas:', error)
    return NextResponse.json(
      { error: 'Error al obtener las paradas' },
      { status: 500 }
    )
  }
}