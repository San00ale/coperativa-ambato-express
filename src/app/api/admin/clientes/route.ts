import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { nombre, email, cedula, password } = await request.json()

    if (!nombre || !email || !cedula || !password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Validar cédula: 10 dígitos
    if (!/^\d{10}$/.test(cedula)) {
      return NextResponse.json({ error: 'La cédula debe tener 10 dígitos' }, { status: 400 })
    }

    const existente = await prisma.usuario.findFirst({
      where: { OR: [{ email }, { cedula }] }
    })
    if (existente) {
      return NextResponse.json({ error: 'El email o la cédula ya están registrados' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const cliente = await prisma.usuario.create({
      data: {
        nombre,
        email,
        cedula,
        password: hashedPassword,
        rol: 'CLIENTE',
        activo: true
      },
      select: { id: true, nombre: true, email: true, cedula: true, rol: true, activo: true }
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Error al crear cliente:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const clientes = await prisma.usuario.findMany({
      where: { rol: 'CLIENTE' },
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

    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
