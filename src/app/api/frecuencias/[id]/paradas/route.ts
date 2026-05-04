import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
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