import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { nombre, email, cedula, password } = await request.json()

    if (!nombre || !email || !cedula || !password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { cedula }]
      }
    })

    if (usuarioExistente) {
      return NextResponse.json({ error: 'El email o la cédula ya están registrados' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        cedula,
        password: hashedPassword,
        rol: 'CLIENTE',
        activo: true
      }
    })

    return NextResponse.json({ message: 'Usuario registrado correctamente' }, { status: 201 })
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}