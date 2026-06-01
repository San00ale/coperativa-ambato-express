import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'OFICINISTA' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cedula = searchParams.get('cedula')

    if (!cedula) {
      return NextResponse.json({ error: 'Cédula requerida' }, { status: 400 })
    }

    const cliente = await prisma.usuario.findFirst({
      where: { cedula, rol: 'CLIENTE' },
      select: { id: true, nombre: true, email: true, cedula: true }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no registrado. Debe crear una cuenta primero.' }, { status: 404 })
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Error al buscar cliente:', error)
    return NextResponse.json({ error: 'Error al buscar cliente' }, { status: 500 })
  }
}