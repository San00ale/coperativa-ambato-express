import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Extraer parámetro de fecha si existe
    const { searchParams } = new URL(request.url)
    const fechaParam = searchParams.get('fecha')

    // Construir objeto de búsqueda dinámico
    const whereClause: any = {}

    // Si es CHOFER, filtrar por su ID
    if (session.user?.role === 'CHOFER') {
      whereClause.choferId = session.user.id
    }

    // Si se proporciona fecha, filtrar por fecha (inicio del día a fin del día)
    if (fechaParam) {
      const fecha = new Date(fechaParam)
      fecha.setHours(0, 0, 0, 0)
      
      const proximoDia = new Date(fecha)
      proximoDia.setDate(proximoDia.getDate() + 1)

      whereClause.fecha = {
        gte: fecha,
        lt: proximoDia
      }
    }

    // Obtener rutas con todas las relaciones
    const rutas = await prisma.ruta.findMany({
      where: whereClause,
      include: {
        frecuencia: {
          include: {
            paradas: {
              orderBy: {
                orden: 'asc'
              }
            }
          }
        },
        bus: true,
        boletos: true,
        chofer: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      },
      orderBy: {
        fecha: 'asc'
      }
    })

    return NextResponse.json(rutas, { status: 200 })
  } catch (error) {
    console.error('Error fetching rutas:', error)
    return NextResponse.json(
      { error: 'Error al obtener las rutas' },
      { status: 500 }
    )
  }
}