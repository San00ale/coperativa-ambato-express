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
      const fechaObj = new Date(fecha)
      where.fecha = {
        gte: new Date(fechaObj.setHours(0, 0, 0, 0)),
        lt: new Date(new Date(fechaObj).setDate(fechaObj.getDate() + 1))
      }
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
        boletos: {
          where: { estado: 'APROBADO' }
        }
      },
      orderBy: { fecha: 'asc' }
    })
    
    return NextResponse.json(rutas)
  } catch (error) {
    console.error('Error al obtener rutas:', error)
    return NextResponse.json(
      { error: 'Error al obtener la lista de rutas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'OFICINISTA') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { frecuenciaId, fecha, busId, precio } = body

    if (!frecuenciaId || !fecha || !busId || precio === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: frecuenciaId, fecha, busId, precio' },
        { status: 400 }
      )
    }

    const ruta = await prisma.ruta.create({
      data: {
        frecuenciaId,
        fecha: new Date(fecha),
        busId,
        precio: parseFloat(precio),
        completada: false
      },
      include: {
        frecuencia: true,
        bus: true
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
