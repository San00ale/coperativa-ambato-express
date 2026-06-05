'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import AdminHeader from '@/components/AdminHeader'

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
          setPromedioDiario(parseFloat((boletos7Dias.length / 7).toFixed(1)))

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
    <div className="p-8 bg-gray-50 min-h-screen">
      <AdminHeader title="Panel de Administrador" showBackButton={false} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-3xl font-bold">{boletosHoy}</span>
          </div>
          <p className="text-blue-100 text-sm">Boletos vendidos hoy</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-3xl font-bold">${ingresosHoy.toFixed(2)}</span>
          </div>
          <p className="text-green-100 text-sm">Ingresos hoy</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-3xl font-bold">{totalBoletosSemana}</span>
          </div>
          <p className="text-purple-100 text-sm">Boletos (7 días)</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-3xl font-bold">{promedioDiario}</span>
          </div>
          <p className="text-orange-100 text-sm">Promedio diario</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Resumen de Ventas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-green-500 pl-4 bg-green-50 rounded-r-lg p-4">
            <h3 className="font-medium text-gray-900">Ventas de Hoy</h3>
            <p className="text-gray-600 text-sm mt-1">Reportes y estadísticas del día</p>
            <div className="mt-3 space-y-2">
              {loadingEstadisticas ? (
                <p className="text-gray-500 text-sm">Cargando estadísticas...</p>
              ) : (
                <>
                  <p className="text-gray-900 font-semibold">
                    Boletos vendidos hoy: {boletosHoy}
                  </p>
                  <p className="text-gray-900 font-semibold">
                    Ingresos totales hoy: ${ingresosHoy.toFixed(2)}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 rounded-r-lg p-4">
            <h3 className="font-medium text-gray-900">Ventas de la Semana</h3>
            <p className="text-gray-600 text-sm mt-1">Últimos 7 días</p>
            <div className="mt-3 space-y-2">
              {loadingEstadisticas ? (
                <p className="text-gray-500 text-sm">Cargando estadísticas...</p>
              ) : (
                <>
                  <p className="text-gray-900 font-semibold">
                    Total boletos (7 días): {totalBoletosSemana}
                  </p>
                  <p className="text-gray-900 font-semibold">
                    Ingresos semanales: ${totalIngresosSemana.toFixed(2)}
                  </p>
                  <p className="text-gray-900 font-semibold">
                    Promedio diario: {promedioDiario} boletos
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Estadísticas de los Últimos 7 Días</h2>
        {loadingEstadisticas ? (
          <p className="text-gray-500 text-sm">Cargando estadísticas...</p>
        ) : estadisticas7Dias.every(dia => dia.cantidad === 0) ? (
          <p className="text-gray-500 text-sm">No hay ventas en los últimos 7 días</p>
        ) : (
          <>
            {mejorDia && mejorDia.ingresos > 0 && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">📈</span>
                  <h3 className="font-semibold text-gray-900">Mejor día</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Fecha:</span>
                    <span className="text-sm font-semibold text-gray-900">{mejorDia.fecha}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Boletos:</span>
                    <span className="text-sm font-semibold text-gray-900">{mejorDia.cantidad}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Ingresos:</span>
                    <span className="text-sm font-semibold text-gray-900">${mejorDia.ingresos.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boletos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estadisticas7Dias.map((dia, index) => (
                    <tr key={index} className={mejorDia?.fecha === dia.fecha ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dia.fecha}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dia.cantidad}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${dia.ingresos.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Top 3 Rutas Más Vendidas</h2>
        {loadingEstadisticas ? (
          <p className="text-gray-500 text-sm">Cargando estadísticas...</p>
        ) : topRutas.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay ventas en los últimos 7 días</p>
        ) : (
          <>
            {topRutas.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🏆</span>
                  <h3 className="font-semibold text-gray-900">Ruta más vendida</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">
                    {topRutas[0].origen} → {topRutas[0].destino}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{topRutas[0].cantidad} boletos</span>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {topRutas.map((ruta, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
                    <span className="text-sm text-gray-900">
                      {ruta.origen} → {ruta.destino}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{ruta.cantidad} boletos</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}