import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
export async function PUT(
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
    const { origen, destino, hora, tipoViaje, activa } = body

    if (!origen || !destino || !hora) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: origen, destino, hora' },
        { status: 400 }
      )
    }