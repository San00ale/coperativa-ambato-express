'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Clock, MapPin, Bus, CheckCircle2, Circle, AlertCircle, Loader } from 'lucide-react'

interface Ruta {
  id: string
  fecha: string
  completada: boolean
  frecuencia: {
    origen: string
    destino: string
    hora: string
    tipoViaje: string
    paradas: Array<{
      id: string
      ciudad: string
      orden: number
    }>
  }
  bus: {
    id: string
    numero: string
    placa: string
    marca: string
    carroceria: string
    chasis: string
    capacidad: number
    asientosVIP: number
  }
  boletos: Array<{
    id: string
  }>
}

export default function MisRutasPage() {
  const { data: session } = useSession()
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actualizando, setActualizando] = useState<string | null>(null)

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obtener la fecha actual en formato ISO
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const fechaFormato = today.toISOString().split('T')[0]

        // Llamar al API de rutas
        const response = await fetch(`/api/rutas?fecha=${fechaFormato}`)

        if (!response.ok) {
          throw new Error('Error al obtener las rutas')
        }

        const data = await response.json()
        setRutas(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Error fetching rutas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRutas()
  }, [])

  const handleMarcarCompletada = async (rutaId: string) => {
    try {
      setActualizando(rutaId)

      const response = await fetch(`/api/rutas/${rutaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completada: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar la ruta')
      }

      // Actualizar el estado local
      setRutas(rutas.map(ruta =>
        ruta.id === rutaId ? { ...ruta, completada: true } : ruta
      ))
    } catch (err) {
      alert('Error al marcar la ruta como completada: ' + (err instanceof Error ? err.message : 'Error desconocido'))
    } finally {
      setActualizando(null)
    }
  }

  const formatearHora = (hora: string) => {
    // Si viene en formato HH:MM, devolver como está
    if (hora.includes(':')) return hora
    // Si viene en otro formato, intentar parsear
    try {
      const date = new Date(hora)
      return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return hora
    }
  }

  const formatearFecha = (fecha: string) => {
    try {
      const date = new Date(fecha)
      return date.toLocaleDateString('es-EC', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return fecha
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Rutas del Día</h1>
        <p className="text-gray-600 mt-2">
          {formatearFecha(new Date().toISOString())}
        </p>
      </div>

      {/* Estados y resumen */}
      {!loading && rutas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Total de Rutas</div>
            <div className="text-3xl font-bold text-gray-900">{rutas.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Completadas</div>
            <div className="text-3xl font-bold text-green-600">
              {rutas.filter(r => r.completada).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Pendientes</div>
            <div className="text-3xl font-bold text-blue-600">
              {rutas.filter(r => !r.completada).length}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <p className="text-gray-600 mt-4">Cargando tus rutas...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error al cargar las rutas</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && rutas.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Bus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay rutas asignadas</h3>
          <p className="text-gray-600 mt-2">
            No tienes rutas programadas para hoy. Revisa tu calendario de turnos.
          </p>
        </div>
      )}

      {/* Rutas List */}
      {!loading && rutas.length > 0 && (
        <div className="space-y-4">
          {rutas.map((ruta) => (
            <div
              key={ruta.id}
              className={`rounded-lg border-2 overflow-hidden transition-all ${
                ruta.completada
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-blue-200 shadow-md hover:shadow-lg'
              }`}
            >
              {/* Ruta Header */}
              <div className={`p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                ruta.completada ? 'bg-gray-100' : 'bg-blue-50'
              }`}>
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-3">
                    {ruta.completada ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-blue-600 shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
                      </h3>
                      <p className={`text-xs sm:text-sm ${
                        ruta.completada ? 'text-gray-600' : 'text-blue-600 font-medium'
                      }`}>
                        {ruta.completada ? 'Ruta completada' : 'Ruta en progreso'}
                      </p>
                    </div>
                  </div>

                  {/* Detalles principales */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div>
                      <div className="text-xs text-gray-600">Hora de Salida</div>
                      <div className="flex items-center gap-1 font-semibold text-gray-900">
                        <Clock size={16} />
                        {formatearHora(ruta.frecuencia.hora)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Bus</div>
                      <div className="font-semibold text-gray-900">{ruta.bus.numero}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Placa</div>
                      <div className="font-semibold text-gray-900 uppercase">{ruta.bus.placa}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Pasajeros</div>
                      <div className="font-semibold text-gray-900">{ruta.boletos.length} / {ruta.bus.capacidad}</div>
                    </div>
                  </div>
                </div>

                {/* Botón de completar */}
                {!ruta.completada && (
                  <button
                    onClick={() => handleMarcarCompletada(ruta.id)}
                    disabled={actualizando === ruta.id}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {actualizando === ruta.id ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Marcar como Completada
                      </>
                    )}
                  </button>
                )}
                {ruta.completada && (
                  <div className="w-full sm:w-auto px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg border border-green-300 text-center">
                    ✓ Completada
                  </div>
                )}
              </div>

              {/* Expandible: Detalles adicionales */}
              <div className="hidden sm:block border-t border-gray-200">
                <div className="p-4 sm:p-6 bg-white space-y-4">
                  {/* Bus Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Bus size={18} />
                      Información del Bus
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      <div>
                        <span className="text-sm text-gray-600">Chasis:</span>
                        <p className="font-medium text-gray-900">{ruta.bus.chasis}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Carrocería:</span>
                        <p className="font-medium text-gray-900">{ruta.bus.carroceria}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Marca:</span>
                        <p className="font-medium text-gray-900">{ruta.bus.marca}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Capacidad:</span>
                        <p className="font-medium text-gray-900">
                          {ruta.bus.capacidad} asientos ({ruta.bus.asientosVIP} VIP)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Paradas */}
                  {ruta.frecuencia.paradas.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin size={18} />
                        Paradas Intermedias
                      </h4>
                      <div className="ml-6 space-y-2">
                        {ruta.frecuencia.paradas.map((parada) => (
                          <div
                            key={parada.id}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            {parada.ciudad}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

