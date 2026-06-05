'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { StatsCardSkeleton, TableSkeleton } from '@/components/Skeleton'

interface Boleto {
  id: string
  precio: number
  estado: string
  createdAt: string
  ruta: {
    frecuencia: {
      origen: string
      destino: string
    }
  }
}

interface EstadisticaDia {
  fecha: string
  cantidad: number
  ingresos: number
}

interface RutaTop {
  origen: string
  destino: string
  cantidad: number
}

export default function AdminPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [boletosHoy, setBoletosHoy] = useState<number>(0)
  const [ingresosHoy, setIngresosHoy] = useState<number>(0)
  const [estadisticas7Dias, setEstadisticas7Dias] = useState<EstadisticaDia[]>([])
  const [topRutas, setTopRutas] = useState<RutaTop[]>([])
  const [totalBoletosSemana, setTotalBoletosSemana] = useState<number>(0)
  const [totalIngresosSemana, setTotalIngresosSemana] = useState<number>(0)
  const [promedioDiario, setPromedioDiario] = useState<number>(0)
  const [mejorDia, setMejorDia] = useState<EstadisticaDia | null>(null)
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    const cargarEstadisticas = async () => {
      try {
        const response = await fetch('/api/boletos')
        if (response.ok) {
          const data: Boleto[] = await response.json()

          // 1. Estadísticas de hoy
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)

          const boletosFiltradosHoy = data.filter(boleto => {
            const fechaBoleto = new Date(boleto.createdAt)
            fechaBoleto.setHours(0, 0, 0, 0)
            return (
              fechaBoleto.getTime() === hoy.getTime() &&
              (boleto.estado === 'APROBADO' || boleto.estado === 'ABORDADO')
            )
          })
          setBoletosHoy(boletosFiltradosHoy.length)
          setIngresosHoy(boletosFiltradosHoy.reduce((total, boleto) => total + boleto.precio, 0))

          // 2. Estadísticas de últimos 7 días
          const hace7Dias = new Date()
          hace7Dias.setDate(hace7Dias.getDate() - 7)
          hace7Dias.setHours(0, 0, 0, 0)

          const boletos7Dias = data.filter(boleto => {
            const fechaBoleto = new Date(boleto.createdAt)
            return (
              fechaBoleto >= hace7Dias &&
              (boleto.estado === 'APROBADO' || boleto.estado === 'ABORDADO')
            )
          })

          const estadisticasPorDia: EstadisticaDia[] = []
          for (let i = 6; i >= 0; i--) {
            const fecha = new Date()
            fecha.setDate(fecha.getDate() - i)
            fecha.setHours(0, 0, 0, 0)

            const boletosDelDia = boletos7Dias.filter(boleto => {
              const fechaBoleto = new Date(boleto.createdAt)
              fechaBoleto.setHours(0, 0, 0, 0)
              return fechaBoleto.getTime() === fecha.getTime()
            })

            estadisticasPorDia.push({
              fecha: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
              cantidad: boletosDelDia.length,
              ingresos: boletosDelDia.reduce((total, boleto) => total + boleto.precio, 0)
            })
          }
          setEstadisticas7Dias(estadisticasPorDia)

          // 3. Top rutas más vendidas
          const rutasContador: { [key: string]: number } = {}
          boletos7Dias.forEach(boleto => {
            const rutaKey = `${boleto.ruta.frecuencia.origen} → ${boleto.ruta.frecuencia.destino}`
            rutasContador[rutaKey] = (rutasContador[rutaKey] || 0) + 1
          })
          const topRutasArray: RutaTop[] = Object.entries(rutasContador)
            .map(([ruta, cantidad]) => {
              const [origen, destino] = ruta.split(' → ')
              return { origen, destino, cantidad }
            })
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 3)
          setTopRutas(topRutasArray)

          // 4. Totales semanales y promedio
          setTotalBoletosSemana(boletos7Dias.length)
          setTotalIngresosSemana(boletos7Dias.reduce((total, boleto) => total + boleto.precio, 0))
          setPromedioDiario(Math.round(boletos7Dias.length / 7))

          // 5. Mejor día (mayor ingreso)
          const diaConMasIngresos = estadisticasPorDia.reduce((max, dia) =>
            dia.ingresos > max.ingresos ? dia : max, estadisticasPorDia[0])
          setMejorDia(diaConMasIngresos)
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setLoadingEstadisticas(false)
      }
    }

    void cargarEstadisticas()
  }, [session, router])

  if (!session) {
    return null
  }

  return (
    <div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {loadingEstadisticas ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📊</span>
                <h3 className="text-sm font-semibold text-green-800">Ventas de Hoy</h3>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-green-900">{boletosHoy}</p>
                <p className="text-sm text-green-700">boletos vendidos</p>
                <p className="text-lg font-semibold text-green-900">${ingresosHoy.toFixed(2)}</p>
                <p className="text-xs text-green-600">ingresos totales</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📈</span>
                <h3 className="text-sm font-semibold text-blue-800">Ventas Semanales</h3>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-blue-900">{totalBoletosSemana}</p>
                <p className="text-sm text-blue-700">boletos (7 días)</p>
                <p className="text-lg font-semibold text-blue-900">${totalIngresosSemana.toFixed(2)}</p>
                <p className="text-xs text-blue-600">ingresos semanales</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📉</span>
                <h3 className="text-sm font-semibold text-purple-800">Promedio Diario</h3>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-purple-900">{promedioDiario}</p>
                <p className="text-sm text-purple-700">boletos por día</p>
                <p className="text-xs text-purple-600">últimos 7 días</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏆</span>
                <h3 className="text-sm font-semibold text-orange-800">Mejor Día</h3>
              </div>
              {mejorDia && mejorDia.ingresos > 0 ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-orange-900">{mejorDia.fecha}</p>
                  <p className="text-xl font-bold text-orange-900">${mejorDia.ingresos.toFixed(2)}</p>
                  <p className="text-xs text-orange-600">ingresos máximos</p>
                </div>
              ) : (
                <p className="text-orange-600 text-sm">Sin datos</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow p-4 sm:p-6 mt-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Estadísticas de los Últimos 7 Días</h2>
        {loadingEstadisticas ? (
          <TableSkeleton rows={7} />
        ) : estadisticas7Dias.every(dia => dia.cantidad === 0) ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <span className="text-4xl mb-2 block">📊</span>
            <p className="text-gray-500 text-sm">No hay ventas en los últimos 7 días</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Boletos</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ingresos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estadisticas7Dias.map((dia, index) => (
                  <tr key={index} className={mejorDia?.fecha === dia.fecha ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dia.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{dia.cantidad}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${dia.ingresos.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow p-4 sm:p-6 mt-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Top 3 Rutas Más Vendidas</h2>
        {loadingEstadisticas ? (
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-8 w-12 bg-gray-200 rounded" />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-8 w-12 bg-gray-200 rounded" />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-8 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        ) : topRutas.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <span className="text-4xl mb-2 block">🏆</span>
            <p className="text-gray-500 text-sm">No hay ventas en los últimos 7 días</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topRutas.map((ruta, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-2 transition ${
                index === 0 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-gray-400 text-white' : 'bg-orange-400 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {ruta.origen} → {ruta.destino}
                    </p>
                    {index === 0 && (
                      <p className="text-xs text-yellow-700 font-medium mt-1">🏆 Más vendida</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{ruta.cantidad}</p>
                  <p className="text-xs text-gray-500">boletos</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}