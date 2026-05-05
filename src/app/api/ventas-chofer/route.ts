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