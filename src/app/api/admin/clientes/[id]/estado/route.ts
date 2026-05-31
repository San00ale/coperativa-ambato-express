import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    const { activo } = await request.json()

    if (typeof activo !== 'boolean') {
      return NextResponse.json({ error: 'El campo activo debe ser booleano' }, { status: 400 })
    }

    const cliente = await prisma.usuario.update({
      where: { id },
      data: { activo },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true
      }
    })

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 })
  }
}
