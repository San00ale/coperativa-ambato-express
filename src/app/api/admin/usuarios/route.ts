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

    const { nombre, email, cedula, password, rol } = await request.json()

    if (!nombre || !email || !cedula || !password || !rol) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (rol !== 'CHOFER' && rol !== 'OFICINISTA') {
      return NextResponse.json({ error: 'Rol no válido. Debe ser CHOFER u OFICINISTA' }, { status: 400 })
    }

    // Validar cédula: 10 dígitos
    if (!/^\d{10}$/.test(cedula)) {
      return NextResponse.json({ error: 'La cédula debe tener 10 dígitos' }, { status: 400 })
    }

    // Validar email: debe terminar en @coperativa.com
    if (!email.endsWith('@coperativa.com')) {
      return NextResponse.json({ error: 'El email debe terminar en @coperativa.com' }, { status: 400 })
    }

    const existente = await prisma.usuario.findFirst({
      where: { OR: [{ email }, { cedula }] }
    })
    if (existente) {
      return NextResponse.json({ error: 'El email o la cédula ya están registrados' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        cedula,
        password: hashedPassword,
        rol,
        activo: true
      },
      select: { id: true, nombre: true, email: true, cedula: true, rol: true, activo: true }
    })

    return NextResponse.json(usuario, { status: 201 })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('GET /api/admin/usuarios - Session:', session?.user?.role)
    if (session?.user?.role !== 'ADMIN') {
      console.log('GET /api/admin/usuarios - No autorizado')
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

    console.log('GET /api/admin/usuarios - Where:', where)
    console.log('GET /api/admin/usuarios - Iniciando consulta Prisma')
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

    console.log('GET /api/admin/usuarios - Usuarios encontrados:', usuarios.length)
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
