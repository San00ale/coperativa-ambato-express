import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PATCH /api/frecuencias/[id]/estado - Cambiar estado de una frecuencia
export async function PATCH(
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
    const { activa } = body

    if (typeof activa !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo activa debe ser un booleano' },
        { status: 400 }
      )
    }

    const frecuencia = await prisma.frecuencia.update({
      where: { id },
      data: { activa }
    })

    return NextResponse.json(frecuencia)
  } catch (error) {
    console.error('Error al cambiar estado de frecuencia:', error)
    return NextResponse.json(
      { error: 'Error al cambiar el estado de la frecuencia' },
      { status: 500 }
    )
  }
}
