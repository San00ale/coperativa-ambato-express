import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'CHOFER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: rutaId } = await context.params
    const { paradaId } = await request.json()

    if (!paradaId) {
      return NextResponse.json({ error: 'paradaId es requerido' }, { status: 400 })
    }

    const ruta = await prisma.ruta.findUnique({ where: { id: rutaId } })

    if (!ruta) return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 })
    if (ruta.choferId !== session.user.id) {
      return NextResponse.json({ error: 'No tienes permiso sobre esta ruta' }, { status: 403 })
    }
    if (ruta.estado !== 'en_curso') {
      return NextResponse.json({ error: 'La ruta no está en curso' }, { status: 400 })
    }

    // Verificar que no se registre la misma parada dos veces
    const yaRegistrada = await prisma.registroParada.findFirst({
      where: { rutaId, paradaId }
    })
    if (yaRegistrada) {
      return NextResponse.json({ error: 'Esta parada ya fue registrada' }, { status: 400 })
    }

    const registro = await prisma.registroParada.create({
      data: { rutaId, paradaId }
    })

    return NextResponse.json(registro, { status: 201 })
  } catch (error) {
    console.error('Error al registrar parada:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { id: rutaId } = await context.params

    const registros = await prisma.registroParada.findMany({
      where: { rutaId },
      include: { parada: true },
      orderBy: { llegada: 'asc' }
    })

    return NextResponse.json(registros)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}