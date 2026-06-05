'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { Clock, MapPin, Bus, CheckCircle2, Circle, AlertCircle, Loader } from 'lucide-react'

interface Ruta {
  id: string
  fecha: string
  estado: string
  inicio: string | null
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
  registrosParada: Array<{
    id: string
    paradaId: string
    llegada: string
    parada: { id: string; ciudad: string; orden: number }
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
  const [modalParada, setModalParada] = useState<string | null>(null)
  const [paradaSeleccionada, setParadaSeleccionada] = useState<string>('')

  // ─────────────────────────────────────────────
  // FETCH RUTAS
  // ─────────────────────────────────────────────
const fetchRutas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/rutas?fecha=${fechaSeleccionada}`)
      if (!response.ok) throw new Error('Error al obtener las rutas')
      const data = await response.json()
      setRutas(data.map((r: Ruta) => ({
        ...r,
        registrosParada: r.registrosParada ?? []
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching rutas:', err)
    } finally {
      setLoading(false)
    }
  }, [fechaSeleccionada])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRutas()
  }, [fetchRutas])

  // ─────────────────────────────────────────────
  // INICIAR VIAJE — re-fetch para traer datos frescos
  // ─────────────────────────────────────────────
  const handleIniciarViaje = async (rutaId: string) => {
    try {
      setActualizando(rutaId)
      setError(null)
      const response = await fetch(`/api/rutas/${rutaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'en_curso', inicio: new Date().toISOString() }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al iniciar viaje')
      }
      await fetchRutas()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar viaje')
    } finally {
      setActualizando(null)
    }
  }

  // ─────────────────────────────────────────────
  // FINALIZAR VIAJE — re-fetch para traer datos frescos
  // ─────────────────────────────────────────────
  const handleFinalizarViaje = async (rutaId: string) => {
    try {
      setActualizando(rutaId)
      setError(null)
      const response = await fetch(`/api/rutas/${rutaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'completada', completada: true }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al finalizar viaje')
      }
      await fetchRutas()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al finalizar viaje')
    } finally {
      setActualizando(null)
    }
  }

  // ─────────────────────────────────────────────
  // REGISTRAR PARADA INTERMEDIA
  // ─────────────────────────────────────────────
  const handleParadaIntermedia = async (rutaId: string) => {
    if (!paradaSeleccionada) return
    try {
      setActualizando(rutaId)
      setError(null)
      const response = await fetch(`/api/rutas/${rutaId}/parada-intermedia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paradaId: paradaSeleccionada })
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al registrar parada')
      }
      const nuevoRegistro = await response.json()
      setRutas(rutas.map(r => {
        if (r.id !== rutaId) return r
        const paradaInfo = r.frecuencia.paradas.find(p => p.id === paradaSeleccionada)
        return {
          ...r,
          registrosParada: [
            ...r.registrosParada,
            { ...nuevoRegistro, parada: paradaInfo! }
          ]
        }
      }))
      setModalParada(null)
      setParadaSeleccionada('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setActualizando(null)
    }
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  const formatearHora = (hora: string) => {
    if (hora.includes(':')) return hora
    try {
      return new Date(hora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return hora
    }
  }

  const formatearFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleDateString('es-EC', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    } catch {
      return fecha
    }
  }

  const calcularHoraLlegada = (horaSalida: string, duracionMinutos: number | null): string | null => {
    if (!duracionMinutos) return null
    try {
      const [horas, minutos] = horaSalida.split(':').map(Number)
      const total = horas * 60 + minutos + duracionMinutos
      const hh = Math.floor(total / 60) % 24
      const mm = total % 60
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
    } catch {
      return null
    }
  }

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaSeleccionada(e.target.value)
  }

  const totalRutas = rutas.length
  const rutasEnCurso = rutas.filter(r => r.estado === 'en_curso').length
  const rutasCompletadas = rutas.filter(r => r.estado === 'completada').length
  const rutasPendientes = rutas.filter(r => r.estado === 'pendiente').length

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Header ── */}
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
          <button
            onClick={fetchRutas}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            ↻ Actualizar
          </button>
          <p className="text-sm text-gray-500">
            Mostrando rutas para el {formatearFecha(fechaSeleccionada + 'T12:00:00')}
          </p>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* ── Resumen ── */}
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

      {/* ── Lista de rutas ── */}
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
          rutas.map(ruta => {
            const paradasPendientes = ruta.frecuencia.paradas.filter(
              p => !ruta.registrosParada.some(r => r.paradaId === p.id)
            )

            return (
              <div key={ruta.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                  {/* ── Información principal ── */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Recorrido</p>
                        <p className="font-bold text-lg text-gray-900">
                          {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Bus className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Bus</p>
                        <p className="font-bold text-gray-900">
                          {ruta.bus.numero} ({ruta.bus.placa})
                        </p>
                      </div>
                    </div>
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
                  </div>

                  {/* ── Información adicional ── */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Ocupación</p>
                      <p className="font-bold text-lg text-gray-900">
                        {ruta.boletos.length} / {ruta.bus.capacidad}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Estado</p>
                      <div
                        className="mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: ruta.estado === 'pendiente' ? '#fef3c7' :
                            ruta.estado === 'en_curso' ? '#fed7aa' : '#dcfce7',
                          color: ruta.estado === 'pendiente' ? '#92400e' :
                            ruta.estado === 'en_curso' ? '#92400e' : '#166534'
                        }}
                      >
                        {ruta.estado === 'pendiente' ? '⏳ Pendiente' :
                          ruta.estado === 'en_curso' ? '🚗 En Curso' :
                          '✅ Completada'}
                      </div>
                    </div>
                  </div>

                  {/* ── Botones de acción ── */}
                  <div className="lg:col-span-1">
                    <div className="space-y-2">

                      {/* Iniciar viaje */}
                      {ruta.estado === 'pendiente' && (
                        <button
                          onClick={() => handleIniciarViaje(ruta.id)}
                          disabled={actualizando === ruta.id}
                          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                        >
                          {actualizando === ruta.id ? (
                            <><Loader size={18} className="animate-spin" /> Iniciando...</>
                          ) : (
                            <><Circle size={18} /> Iniciar viaje</>
                          )}
                        </button>
                      )}

                      {/* Parada intermedia */}
                      {ruta.estado === 'en_curso' && paradasPendientes.length > 0 && (
                        <button
                          onClick={() => { setModalParada(ruta.id); setParadaSeleccionada('') }}
                          disabled={actualizando === ruta.id}
                          className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <MapPin size={18} />
                          Parada intermedia
                        </button>
                      )}

                      {/* Finalizar viaje */}
                      {ruta.estado === 'en_curso' && (
                        <button
                          onClick={() => handleFinalizarViaje(ruta.id)}
                          disabled={actualizando === ruta.id}
                          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                        >
                          {actualizando === ruta.id ? (
                            <><Loader size={18} className="animate-spin" /> Finalizando...</>
                          ) : (
                            <><CheckCircle2 size={18} /> Finalizar viaje</>
                          )}
                        </button>
                      )}

                      {/* Viaje completado */}
                      {ruta.estado === 'completada' && (
                        <div className="w-full px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center gap-2 text-green-700 font-bold">
                          <CheckCircle2 size={18} />
                          Viaje completado
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Paradas con progreso ── */}
                {ruta.frecuencia.paradas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900">Paradas:</p>
                      {ruta.estado === 'en_curso' && (
                        <span className="text-xs text-gray-500">
                          {ruta.registrosParada.length} de {ruta.frecuencia.paradas.length} completadas
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ruta.frecuencia.paradas.map((parada) => {
                        const completada = ruta.registrosParada.some(r => r.paradaId === parada.id)
                        return (
                          <span
                            key={parada.id}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              completada
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {completada ? '✓' : `${parada.orden}.`} {parada.ciudad}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── Modal parada intermedia ── */}
      {modalParada && (() => {
        const ruta = rutas.find(r => r.id === modalParada)
        if (!ruta) return null
        const paradasPendientes = ruta.frecuencia.paradas.filter(
          p => !ruta.registrosParada.some(r => r.paradaId === p.id)
        )
        return (
          <div
            style={{ minHeight: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className="fixed inset-0 z-50 p-4"
          >
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-bold text-gray-900 text-lg mb-1">Registrar parada</h3>
              <p className="text-sm text-gray-500 mb-4">
                {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
              </p>
              <div className="space-y-2 mb-6">
                {paradasPendientes.map(parada => (
                  <label
                    key={parada.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                      paradaSeleccionada === parada.id
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="parada"
                      value={parada.id}
                      checked={paradaSeleccionada === parada.id}
                      onChange={() => setParadaSeleccionada(parada.id)}
                      className="accent-yellow-500"
                    />
                    <span className="font-medium text-gray-900">{parada.orden}. {parada.ciudad}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setModalParada(null); setParadaSeleccionada('') }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleParadaIntermedia(modalParada)}
                  disabled={!paradaSeleccionada || actualizando === modalParada}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white py-2 rounded-lg font-bold"
                >
                  {actualizando === modalParada ? 'Guardando...' : 'Confirmar llegada'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}