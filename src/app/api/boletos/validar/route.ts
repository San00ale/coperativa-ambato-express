import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'CHOFER' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
        const body = await request.json()
    const { qrData } = body

    if (!qrData) {
      return NextResponse.json({ error: 'Se requiere el dato del QR' }, { status: 400 })
    }

    let boletoId: string
    try {
      const parsed = JSON.parse(qrData)
      boletoId = parsed.boletoId
    } catch {
      return NextResponse.json({ error: 'QR inválido' }, { status: 400 })
    }
        const boleto = await prisma.boleto.findUnique({
      where: { id: boletoId },
      include: {
        ruta: {
          include: {
            frecuencia: true
          }
        },
        pasajero: true
      }
    })

    if (!boleto) {
      return NextResponse.json({ error: 'Boleto no encontrado' }, { status: 404 })
    }

    if (boleto.estado !== 'APROBADO') {
      return NextResponse.json({ error: 'El boleto no está aprobado' }, { status: 400 })
    }

    const fechaViaje = new Date(boleto.ruta.fecha)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    if (fechaViaje < hoy) {
      return NextResponse.json({ error: 'El viaje ya pasó' }, { status: 400 })
    }