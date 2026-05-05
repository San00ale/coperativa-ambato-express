import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'CHOFER' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { rutaId, asiento, precio, tipoPasajero, metodoPago, pasajeroNombre, pasajeroCedula } = body

    if (!rutaId || !asiento || !precio || !pasajeroNombre || !pasajeroCedula) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: rutaId, asiento, precio, pasajeroNombre, pasajeroCedula' },
        { status: 400 }
      )
    }

    // Verificar asiento disponible
    const boletoExistente = await prisma.boleto.findFirst({
      where: {
        rutaId: rutaId,
        asiento: asiento,
        estado: { not: 'CANCELADO' }
      }
    })

    if (boletoExistente) {
      return NextResponse.json(
        { error: 'El asiento ya está ocupado' },
        { status: 409 }
      )
    }

    // Calcular descuento (50% para niño, tercera edad, discapacitado)
    let descuento = 0
    if (tipoPasajero === 'NINO' || tipoPasajero === 'TERCERA_EDAD' || tipoPasajero === 'DISCAPACITADO') {
      descuento = precio * 0.5
    }
    const precioFinal = precio - descuento

    // Buscar o crear el pasajero
    let pasajero = await prisma.usuario.findUnique({
      where: { cedula: pasajeroCedula }
    })

    if (!pasajero) {
      pasajero = await prisma.usuario.create({
        data: {
          email: `${pasajeroCedula}@temporal.com`,
          password: await bcrypt.hash('temporal', 10),
          nombre: pasajeroNombre,
          cedula: pasajeroCedula,
          rol: 'CLIENTE'
        }
      })
    }

    // Crear el boleto (directamente APROBADO porque el chofer cobra en el momento)
    const boleto = await prisma.boleto.create({
      data: {
        rutaId,
        pasajeroId: pasajero.id,
        asiento,
        precio: precioFinal,
        descuento,
        tipoPasajero: tipoPasajero || 'ADULTO',
        metodoPago: metodoPago || 'EFECTIVO',
        estado: 'APROBADO',
        vendidoPor: 'chofer',
        vendidoPorChoferId: session.user.id
      },
      include: {
        ruta: {
          include: {
            frecuencia: true,
            bus: true
          }
        },
        pasajero: true
      }
    })

    return NextResponse.json(boleto, { status: 201 })
  } catch (error) {
    console.error('Error al crear venta del chofer:', error)
    return NextResponse.json({ error: 'Error al crear la venta' }, { status: 500 })
  }
}