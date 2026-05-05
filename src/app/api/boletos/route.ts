import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// POST /api/boletos - Crear un nuevo boleto
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
        const body = await request.json()
    const { rutaId, asiento, precio, tipoPasajero, metodoPago, comprobanteUrl, pasajeroNombre, pasajeroCedula } = body

    if (!rutaId || !asiento || !precio) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: rutaId, asiento, precio' },
        { status: 400 }
      )
    }
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
        let descuento = 0
    if (tipoPasajero === 'NINO' || tipoPasajero === 'TERCERA_EDAD' || tipoPasajero === 'DISCAPACITADO') {
      descuento = precio * 0.5
    }
    const precioFinal = precio - descuento

    const estado = metodoPago === 'TRANSFERENCIA' ? 'PENDIENTE_APROBACION' : 'APROBADO'
        let pasajeroId = session.user.id
    if (pasajeroNombre && pasajeroCedula) {
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
      pasajeroId = pasajero.id
    }
        const boleto = await prisma.boleto.create({
      data: {
        rutaId,
        pasajeroId,
        asiento,
        precio: precioFinal,
        descuento,
        tipoPasajero: tipoPasajero || 'ADULTO',
        metodoPago,
        comprobanteUrl: comprobanteUrl || null,
        estado,
        vendidoPor: session.user.role === 'CHOFER' ? 'chofer' : 'oficinista'
      },
      include: {
        ruta: {
          include: {
            frecuencia: true,
            bus: true
          }
        }
      }
    })

    return NextResponse.json(boleto, { status: 201 })
  } catch (error) {
    console.error('Error al crear boleto:', error)
    return NextResponse.json({ error: 'Error al crear el boleto' }, { status: 500 })
  }
}
