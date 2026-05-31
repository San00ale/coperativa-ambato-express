import type { Prisma } from '@prisma/client'
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
    const asientoValue = String(asiento)

    // Validar campos requeridos
    if (!rutaId || !asiento || !precio) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: rutaId, asiento, precio' },
        { status: 400 }
      )
    }

    // Convertir asiento a string (Prisma espera String)
    // ya está en asientoValue

    // Verificar que el asiento no esté ocupado en esa ruta
    const boletoExistente = await prisma.boleto.findFirst({
      where: {
        rutaId: rutaId,
        asiento: asientoValue,
        estado: { not: 'CANCELADO' }
      }
    })

    if (boletoExistente) {
      return NextResponse.json(
        { error: 'El asiento ya está ocupado' },
        { status: 409 }
      )
    }

    // Calcular descuento según tipo de pasajero (50% para niño, tercera edad, discapacitado)
    let descuento = 0
    if (tipoPasajero === 'NINO' || tipoPasajero === 'TERCERA_EDAD' || tipoPasajero === 'DISCAPACITADO') {
      descuento = precio * 0.5
    }
    const precioFinal = precio - descuento

    // Determinar estado según método de pago
    const estado = metodoPago === 'TRANSFERENCIA' ? 'PENDIENTE_APROBACION' : 'APROBADO'

    // *** LÓGICA CORREGIDA PARA ASIGNAR PASAJERO ***
    let pasajeroId = session.user.id

    // Solo para roles que venden boletos a terceros (chofer u oficinista) se permite crear/buscar pasajero por cédula
    if (session.user.role === 'CHOFER' || session.user.role === 'OFICINISTA') {
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
    } else {
      // Para cliente autenticado, se usa su propio ID y se ignora cualquier dato de pasajero enviado
      if (pasajeroNombre || pasajeroCedula) {
        console.warn('Cliente autenticado intentó enviar datos de pasajero; se ignora y se usa su propia cuenta.')
      }
    }

    // Crear el boleto
    const boleto = await prisma.boleto.create({
      data: {
        rutaId,
        pasajeroId,
        asiento: asientoValue,
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

// GET /api/boletos - Listar boletos según rol del usuario
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pendientes = searchParams.get('pendientes') === 'true'

    const where: Prisma.BoletoWhereInput = {}

    if (session.user.role === 'CLIENTE') {
      where.pasajeroId = session.user.id
    }
    
    if (session.user.role === 'OFICINISTA' && pendientes) {
      where.estado = 'PENDIENTE_APROBACION'
    }

    const boletos = await prisma.boleto.findMany({
      where,
      include: {
        ruta: {
          include: {
            frecuencia: true,
            bus: true
          }
        },
        pasajero: {
          select: { nombre: true, cedula: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(boletos)
  } catch (error) {
    console.error('Error al obtener boletos:', error)
    return NextResponse.json({ error: 'Error al obtener boletos' }, { status: 500 })
  }
}