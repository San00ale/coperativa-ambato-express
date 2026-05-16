import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rol = searchParams.get('rol')

    let where: any = {}
    if (rol === 'CHOFER' || rol === 'OFICINISTA') {
      where.rol = rol
    } else {
      where.rol = { in: ['CHOFER', 'OFICINISTA'] }
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        email: true,
        cedula: true,
        rol: true,
        activo: true
      },
      orderBy: { nombre: 'asc' }
    })

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}