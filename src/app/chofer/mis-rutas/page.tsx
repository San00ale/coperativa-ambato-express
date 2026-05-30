'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Clock, MapPin, Bus, CheckCircle2, Circle, AlertCircle, Loader } from 'lucide-react'

interface Ruta {
  id: string
  fecha: string
  estado: string           // ← NUEVO
  inicio: string | null    // ← NUEVO
  completada: boolean
  frecuencia: {
    origen: string
    destino: string
    hora: string
    duracion: number | null
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
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    return new Date().toLocaleDateString('en-CA')
  })

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/rutas?fecha=${fechaSeleccionada}`)

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
  }, [fechaSeleccionada])

  // ← NUEVO: Función para iniciar viaje
  const handleIniciarViaje = async (rutaId: string) => {
    try {
      setActualizando(rutaId)
      setError(null)

      const ahora = new Date().toISOString()

      const response = await fetch(`/api/rutas/${rutaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'en_curso',
          inicio: ahora,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al iniciar viaje')
      }

      // Actualizar en el estado local
      setRutas(rutas.map(ruta =>
        ruta.id === rutaId 
          ? { ...ruta, estado: 'en_curso', inicio: ahora }
          : ruta
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar viaje')
    } finally {
      setActualizando(null)
    }
  }

  // ← NUEVO: Función para finalizar viaje
  const handleFinalizarViaje = async (rutaId: string) => {
    try {
      setActualizando(rutaId)
      setError(null)

      const response = await fetch(`/api/rutas/${rutaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'completada',
          completada: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al finalizar viaje')
      }

      // Actualizar en el estado local
      setRutas(rutas.map(ruta =>
        ruta.id === rutaId 
          ? { ...ruta, estado: 'completada', completada: true }
          : ruta
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al finalizar viaje')
    } finally {
      setActualizando(null)
    }
  }

  const formatearHora = (hora: string) => {
    if (hora.includes(':')) return hora
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

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaSeleccionada(e.target.value)
  }
// ← NUEVO: Calcular hora de llegada estimada (Issue #103)
const calcularHoraLlegada = (horaSalida: string, duracionMinutos: number | null): string | null => {
  if (!duracionMinutos) return null
  
  try {
    const [horas, minutos] = horaSalida.split(':').map(Number)
    let minutosTotales = horas * 60 + minutos
    minutosTotales += duracionMinutos
    
    const horasLlegada = Math.floor(minutosTotales / 60) % 24
    const minutosLlegada = minutosTotales % 60
    
    return `${String(horasLlegada).padStart(2, '0')}:${String(minutosLlegada).padStart(2, '0')}`
  } catch (error) {
    return null
  }
}

  // ← NUEVO: Obtener conteos por estado
  const totalRutas = rutas.length
  const rutasEnCurso = rutas.filter(r => r.estado === 'en_curso').length
  const rutasCompletadas = rutas.filter(r => r.estado === 'completada').length
  const rutasPendientes = rutas.filter(r => r.estado === 'pendiente').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Rutas</h1>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-gray-600">Selecciona una fecha:</label>
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={handleFechaChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500">
            Mostrando rutas para el {formatearFecha(fechaSeleccionada + 'T12:00:00')}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Resumen de Rutas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 font-semibold">Total</div>
          <div className="text-3xl font-bold text-blue-900">{totalRutas}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-700 font-semibold">Pendientes</div>
          <div className="text-3xl font-bold text-yellow-900">{rutasPendientes}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-700 font-semibold">En Curso</div>
          <div className="text-3xl font-bold text-orange-900">{rutasEnCurso}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 font-semibold">Completadas</div>
          <div className="text-3xl font-bold text-green-900">{rutasCompletadas}</div>
        </div>
      </div>

      {/* Rutas List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : rutas.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <Bus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No hay rutas asignadas</p>
            <p className="text-gray-500 text-sm">No tienes rutas programadas para hoy.</p>
          </div>
        ) : (
          rutas.map(ruta => (
            <div key={ruta.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Información Principal */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Ruta */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Recorrido</p>
                      <p className="font-bold text-lg text-gray-900">
                        {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
                      </p>
                    </div>
                  </div>

                  {/* Bus */}
                  <div className="flex items-start gap-3">
                    <Bus className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Bus</p>
                      <p className="font-bold text-gray-900">
                        {ruta.bus.numero} ({ruta.bus.placa})
                      </p>
                    </div>
                  </div>

                  {/* Hora */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Horarios</p>
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900">
                          Salida: {formatearHora(ruta.frecuencia.hora)}
                        </p>
                        {(() => {
                          const horaLlegada = calcularHoraLlegada(ruta.frecuencia.hora, ruta.frecuencia.duracion)
                          return horaLlegada && (
                            <p className="font-bold text-green-700">
                              Llegada estimada: {horaLlegada}
                            </p>
                          )
                        })()}
                      </div>
                    </div>
                  </div>

                {/* Información Adicional */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Capacidad */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Ocupación</p>
                    <p className="font-bold text-lg text-gray-900">
                      {ruta.boletos.length} / {ruta.bus.capacidad}
                    </p>
                  </div>

                  {/* Estado */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Estado</p>
                    <div className="mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: ruta.estado === 'pendiente' ? '#fef3c7' : 
                                       ruta.estado === 'en_curso' ? '#fed7aa' :
                                       '#dcfce7',
                        color: ruta.estado === 'pendiente' ? '#92400e' : 
                               ruta.estado === 'en_curso' ? '#92400e' :
                               '#166534'
                      }}>
                      {ruta.estado === 'pendiente' ? '⏳ Pendiente' :
                       ruta.estado === 'en_curso' ? '🚗 En Curso' :
                       '✅ Completada'}
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="lg:col-span-1">
                  <div className="space-y-2">
                    {/* ← NUEVO: Botón Iniciar Viaje */}
                    {ruta.estado === 'pendiente' && (
                      <button
                        onClick={() => handleIniciarViaje(ruta.id)}
                        disabled={actualizando === ruta.id}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                      >
                        {actualizando === ruta.id ? (
                          <>
                            <Loader size={18} className="animate-spin" />
                            Iniciando...
                          </>
                        ) : (
                          <>
                            <Circle size={18} />
                            Iniciar viaje
                          </>
                        )}
                      </button>
                    )}

                    {/* ← NUEVO: Botón Finalizar Viaje */}
                    {ruta.estado === 'en_curso' && (
                      <button
                        onClick={() => handleFinalizarViaje(ruta.id)}
                        disabled={actualizando === ruta.id}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                      >
                        {actualizando === ruta.id ? (
                          <>
                            <Loader size={18} className="animate-spin" />
                            Finalizando...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            Finalizar viaje
                          </>
                        )}
                      </button>
                    )}

                    {/* ← NUEVO: Texto Viaje Completado */}
                    {ruta.estado === 'completada' && (
                      <div className="w-full px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center gap-2 text-green-700 font-bold">
                        <CheckCircle2 size={18} />
                        Viaje completado
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Paradas Intermedias */}
              {ruta.frecuencia.paradas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Paradas:</p>
                  <div className="flex flex-wrap gap-2">
                    {ruta.frecuencia.paradas.map((parada, idx) => (
                      <span key={parada.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                        {idx + 1}. {parada.ciudad}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}