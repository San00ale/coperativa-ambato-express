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