import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Por seguridad, siempre retornamos el mismo mensaje
    // incluso si el email no existe
    if (!usuario) {
      return NextResponse.json(
        { message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' },
        { status: 200 }
      )
    }

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hora

    // Actualizar usuario con el token
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken,
        resetTokenExpires
      }
    })

    // Aquí deberías enviar el correo con el enlace
    // Por ahora, en desarrollo, retornamos el token para testing
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/restablecer-contrasena?token=${resetToken}`

    // TODO: Enviar correo real usando Resend o similar
    // await sendResetEmail(usuario.email, resetUrl)

    console.log('Enlace de restablecimiento:', resetUrl)

    return NextResponse.json(
      { 
        message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
        // Solo para desarrollo, remover en producción
        resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error en forgot-password:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
