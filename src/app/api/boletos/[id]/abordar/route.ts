import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * PATCH /api/boletos/[id]/abordar
 * Registra el abordaje de un pasajero
 *
 * Body:
 * {
 *   rutaId: "ruta-123"  // Para validar que es la ruta actual
 * }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Promise
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'CHOFER') {
      return NextResponse.json(
        { error: 'No autenticado o no eres chofer' },
        { status: 401 }
      )
    }

    const { id: boletoId } = await params  // ← await
    const { rutaId } = await request.json()

    // ✅ Obtener boleto con relaciones
    const boleto = await prisma.boleto.findUnique({
      where: { id: boletoId },
      include: {
        ruta: {
          include: {
            frecuencia: true,
            chofer: true
          }
        },
        pasajero: {
          select: {
            nombre: true,
            cedula: true
          }
        }
      }
    })

    if (!boleto) {
      return NextResponse.json(
        { error: 'Boleto no encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // ✅ Validación 1: Boleto ya abordado
    if (boleto.estado === 'ABORDADO') {
      return NextResponse.json(
        {
          error: 'Este boleto ya fue utilizado para abordar el bus',
          code: 'ALREADY_BOARDED',
          boleto
        },
        { status: 400 }
      )
    }

    // ✅ Validación 2: Boleto rechazado o cancelado
    if (['RECHAZADO', 'CANCELADO'].includes(boleto.estado)) {
      return NextResponse.json(
        {
          error: `El boleto no está vigente (estado: ${boleto.estado})`,
          code: 'INVALID_STATE',
          boleto
        },
        { status: 400 }
      )
    }

    // ✅ Validación 3: Boleto no aprobado
    if (boleto.estado !== 'APROBADO') {
      return NextResponse.json(
        {
          error: `Boleto en estado inválido: ${boleto.estado}`,
          code: 'WRONG_STATE',
          boleto
        },
        { status: 400 }
      )
    }

    // ✅ Validación 4: Ruta actual del chofer
    if (boleto.ruta.id !== rutaId) {
      return NextResponse.json(
        {
          error: 'Este boleto corresponde a otra ruta',
          code: 'WRONG_ROUTE',
          boleto,
          rutaEsperada: boleto.ruta.id,
          rutaActual: rutaId
        },
        { status: 400 }
      )
    }

    // ✅ Validación 5: Chofer correcto
    if (boleto.ruta.choferId !== session.user.id) {
      return NextResponse.json(
        {
          error: 'Este boleto no es de tu ruta actual',
          code: 'WRONG_CHOFER'
        },
        { status: 403 }
      )
    }

    // ✅ ACTUALIZAR estado a ABORDADO
    const boletoActualizado = await prisma.boleto.update({
      where: { id: boletoId },
      data: {
        estado: 'ABORDADO',
      },
      include: {
        ruta: {
          include: {
            frecuencia: true,
            bus: true
          }
        },
        pasajero: {
          select: {
            nombre: true,
            cedula: true
          }
        }
      }
    })

    console.log(`[Abordar] Boleto ${boletoId} abordado correctamente`)

    return NextResponse.json(boletoActualizado, { status: 200 })
  } catch (error) {
    console.error('Error registrando abordaje:', error)
    return NextResponse.json(
      { error: 'Error al registrar abordaje', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/boletos/[id]/abordar
 * Obtiene datos del boleto para verificar antes de abordar
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Promise
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'CHOFER') {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params  // ← await

    const boleto = await prisma.boleto.findUnique({
      where: { id },
      include: {
        ruta: {
          include: {
            frecuencia: true,
            bus: true
          }
        },
        pasajero: {
          select: {
            nombre: true,
            cedula: true
          }
        }
      }
    })

    if (!boleto) {
      return NextResponse.json(
        { error: 'Boleto no encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json(boleto, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo boleto:', error)
    return NextResponse.json(
      { error: 'Error al obtener boleto', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}