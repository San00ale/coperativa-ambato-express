import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha')
    const origen = searchParams.get('origen')
    const destino = searchParams.get('destino')
    
    const where: any = {}

    if (session?.user?.role === 'CHOFER') {
      where.choferId = session.user.id
    }
    
    if (fecha) {
      // Ecuador UTC-5: ajustar rango
      const [year, month, day] = fecha.split('-').map(Number)
      const start = new Date(Date.UTC(year, month-1, day, 0, 0, 0, 0))
const end = new Date(Date.UTC(year, month-1, day + 1, 0, 0, 0, 0))
      where.fecha = { gte: start, lt: end }
    }
    
    if (origen || destino) {
      where.frecuencia = {}
      if (origen) where.frecuencia.origen = origen
      if (destino) where.frecuencia.destino = destino
    }
    
    const rutas = await prisma.ruta.findMany({
      where,
      include: {
        frecuencia: {
          include: {
            paradas: {
              orderBy: { orden: 'asc' }
            }
          }
        },
        bus: true,
        chofer: true,
        boletos: {
          where: { estado: 'APROBADO' }
        }
      },
      orderBy: { fecha: 'asc' }
    })
    
    return NextResponse.json(rutas)
  } catch (error) {
    console.error('Error al obtener rutas:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  // ... (sin cambios, igual que antes)
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'OFICINISTA') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { frecuenciaId, fecha, busId, precio, choferId } = body

    if (!frecuenciaId || !fecha || !busId || precio === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: frecuenciaId, fecha, busId, precio' },
        { status: 400 }
      )
    }

    if (choferId) {
      const chofer = await prisma.usuario.findUnique({
        where: { id: choferId, rol: 'CHOFER' }
      })
      if (!chofer) {
        return NextResponse.json({ error: 'Chofer no válido' }, { status: 400 })
      }
    }

    const ruta = await prisma.ruta.create({
      data: {
        frecuenciaId,
        fecha: new Date(fecha),
        busId,
        precio: parseFloat(precio),
        choferId: choferId || null,
        completada: false
      },
      include: {
        frecuencia: true,
        bus: true,
        chofer: true
      }
    })
    return NextResponse.json(ruta, { status: 201 })
  } catch (error) {
    console.error('Error al crear ruta:', error)
    return NextResponse.json(
      { error: 'Error al crear la ruta' },
      { status: 500 }
    )
  }
}