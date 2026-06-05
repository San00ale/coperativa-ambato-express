import type { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'
import { enviarCorreoQR } from '@/lib/email'
import { validarCedulaEcuatoriana } from '@/lib/validations'

// POST /api/boletos - Crear un nuevo boleto
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { rutaId, asiento, asientos, precio, tipoPasajero, metodoPago, comprobanteUrl, pasajeroNombre, pasajeroCedula } = body

    // Soportar tanto asiento (string) como asientos (array) para compatibilidad
    const listaAsientos = asientos ? (Array.isArray(asientos) ? asientos : [asientos]) : (asiento ? [asiento] : [])

    // Validar campos requeridos
    if (!rutaId || listaAsientos.length === 0 || !precio) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: rutaId, asientos, precio' },
        { status: 400 }
      )
    }

    if (pasajeroCedula && !validarCedulaEcuatoriana(String(pasajeroCedula))) {
      return NextResponse.json(
        { error: 'Cédula ecuatoriana inválida' },
        { status: 400 }
      )
    }

    const rutaExistente = await prisma.ruta.findUnique({
      where: { id: rutaId },
      include: { boletos: true }
    })

    if (!rutaExistente) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 })
    }

    // Verificar que todos los asientos estén disponibles
    const asientosOcupados = listaAsientos.filter((asientoNum: number | string) =>
      rutaExistente.boletos.some(
        (b) => b.asiento === String(asientoNum) && ['APROBADO', 'ABORDADO'].includes(b.estado)
      )
    )

    if (asientosOcupados.length > 0) {
      return NextResponse.json(
        { error: `Asientos no disponibles: ${asientosOcupados.join(', ')}` },
        { status: 400 }
      )
    }

    // Verificar que los asientos no estén ocupados en esa ruta
    const boletosExistentes = await prisma.boleto.findMany({
      where: {
        rutaId: rutaId,
        asiento: { in: listaAsientos.map((a: number | string) => String(a)) },
        estado: { not: 'CANCELADO' }
      }
    })

    if (boletosExistentes.length > 0) {
      return NextResponse.json(
        { error: 'Algunos asientos ya están ocupados' },
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
    const estado = metodoPago === 'TRANSFERENCIA' ? 'PENDIENTE_APROBACION' : 'ABORDADO'

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

    // Crear múltiples boletos en una transacción
    const boletosCreados = await prisma.$transaction(async (tx) => {
      const boletos = []
      for (const asientoNum of listaAsientos) {
        const asientoValue = String(asientoNum)
        const boleto = await tx.boleto.create({
          data: {
            rutaId,
            pasajeroId,
            asiento: asientoValue,
            precio: precioFinal / listaAsientos.length, // Dividir precio entre asientos
            descuento: descuento / listaAsientos.length,
            tipoPasajero: tipoPasajero || 'ADULTO',
            metodoPago,
            comprobanteUrl: comprobanteUrl || null,
            estado,
            vendidoPor: session.user.role === 'CHOFER' ? 'chofer' : 'oficinista',
            vendidoPorChoferId: session.user.role === 'CHOFER' ? session.user.id : null
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
        boletos.push(boleto)
      }
      return boletos
    })

    // Generar QR para pagos en efectivo (solo para el primer boleto)
    let qrUrl = null
    if (metodoPago === 'EFECTIVO' && boletosCreados.length > 0) {
      const primerBoleto = boletosCreados[0]
      const pasajero = await prisma.usuario.findUnique({ where: { id: pasajeroId } })
      const ruta = await prisma.ruta.findUnique({
        where: { id: rutaId },
        include: { frecuencia: true }
      })
      if (pasajero && ruta) {
        const asientosStr = listaAsientos.map((a: number | string) => String(a)).join(', ')
        const qrData = JSON.stringify({
          boletoId: primerBoleto.id,
          ruta: `${ruta.frecuencia.origen} → ${ruta.frecuencia.destino}`,
          fecha: ruta.fecha,
          hora: ruta.frecuencia.hora,
          asientos: asientosStr,
          pasajero: pasajero.nombre,
          cedula: pasajero.cedula
        })
        qrUrl = await QRCode.toDataURL(qrData)
        await prisma.boleto.update({
          where: { id: primerBoleto.id },
          data: { qrUrl }
        })
        await enviarCorreoQR(
          pasajero.email,
          pasajero.nombre,
          qrUrl,
          `${ruta.frecuencia.origen} → ${ruta.frecuencia.destino}`,
          ruta.fecha.toString(),
          asientosStr
        )
      }
    }

    return NextResponse.json({ boletos: boletosCreados, qrUrl }, { status: 201 })
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