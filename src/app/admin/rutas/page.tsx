'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TableSkeleton } from '@/components/Skeleton'
import Pagination from '@/components/Pagination'

interface Frecuencia {
  id: string
  origen: string
  destino: string
  hora: string
  tipoViaje: 'DIRECTO' | 'CON_PARADAS'
  activa: boolean
}

interface Bus {
  id: string
  numero: string
  placa: string
  marca: string
  capacidad: number
  activo: boolean
}

interface Chofer {
  id: string
  nombre: string
}

interface Ruta {
  id: string
  frecuenciaId: string
  busId: string
  fecha: string
  precio?: number
  choferId?: string | null
  chofer?: { nombre: string }
  frecuencia: Frecuencia
  bus: Bus
}

export default function RutasPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [frecuencias, setFrecuencias] = useState<Frecuencia[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [choferes, setChoferes] = useState<Chofer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const obtenerFechaLocal = () => {
    const hoy = new Date()
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  }

  const fechaMinima = obtenerFechaLocal()

  // Formulario (incluye precio y choferId)
  const [formData, setFormData] = useState({
    frecuenciaId: '',
    busId: '',
    fecha: fechaMinima,
    precio: '',
    choferId: ''          // ← nuevo campo
  })

  const cargarDatos = useCallback(async () => {
    try {
      const rutasResponse = await fetch('/api/rutas')
      if (rutasResponse.ok) {
        const rutasData = await rutasResponse.json()
        setRutas(rutasData)
      }

      const frecuenciasResponse = await fetch('/api/frecuencias')
      if (frecuenciasResponse.ok) {
        const frecuenciasData = await frecuenciasResponse.json()
        setFrecuencias(frecuenciasData.filter((f: Frecuencia) => f.activa))
      }

      const busesResponse = await fetch('/api/buses')
      if (busesResponse.ok) {
        const busesData = await busesResponse.json()
        setBuses(busesData.filter((b: Bus) => b.activo))
      }

      const choferesResponse = await fetch('/api/admin/usuarios?rol=CHOFER')
      if (choferesResponse.ok) {
        const choferesData = await choferesResponse.json()
        setChoferes(choferesData)
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    const iniciarCarga = async () => {
      await cargarDatos()
    }

    void iniciarCarga()
  }, [session, router, cargarDatos])

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/rutas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frecuenciaId: formData.frecuenciaId,
          busId: formData.busId,
          fecha: formData.fecha,
          precio: parseFloat(formData.precio),
          choferId: formData.choferId || null   // ← enviar choferId
        }),
      })

      if (response.ok) {
        setSuccess('Ruta creada correctamente')
        setFormData({ frecuenciaId: '', busId: '', fecha: '', precio: '', choferId: '' })
        await cargarDatos()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al crear la ruta')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEliminar = async (ruta: Ruta) => {
    if (!confirm(`¿Estás seguro de eliminar la ruta ${ruta.frecuencia.origen}-${ruta.frecuencia.destino} del ${ruta.fecha}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/rutas/${ruta.id}`, { method: 'DELETE' })
      if (response.ok) {
        await cargarDatos()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al eliminar la ruta')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  if (loading) {
    return <TableSkeleton rows={5} />
  }

  // Calculate pagination
  const totalPages = Math.ceil(rutas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRutas = rutas.slice(startIndex, endIndex)

  return (
    <div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span>{success}</span>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Formulario de creación */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <span className="text-2xl">➕</span>
              Crear Nueva Ruta
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="frecuenciaId" className="block text-sm font-semibold text-gray-700 mb-2">Frecuencia *</label>
                <select
                  id="frecuenciaId"
                  name="frecuenciaId"
                  value={formData.frecuenciaId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Seleccionar frecuencia...</option>
                  {frecuencias.map(f => (
                    <option key={f.id} value={f.id}>{f.origen} - {f.destino} ({f.hora})</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="busId" className="block text-sm font-semibold text-gray-700 mb-2">Bus *</label>
                <select
                  id="busId"
                  name="busId"
                  value={formData.busId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Seleccionar bus...</option>
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>Bus {b.numero} ({b.placa}) - {b.marca}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="fecha" className="block text-sm font-semibold text-gray-700 mb-2">Fecha *</label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                  min={fechaMinima}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="precio" className="block text-sm font-semibold text-gray-700 mb-2">Precio ($) *</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Ej: 5.00"
                />
              </div>

              {/* Selector de chofer (opcional) */}
              <div>
                <label htmlFor="choferId" className="block text-sm font-semibold text-gray-700 mb-2">Chofer (opcional)</label>
                <select
                  id="choferId"
                  name="choferId"
                  value={formData.choferId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Seleccionar chofer...</option>
                  {choferes.map(chofer => (
                    <option key={chofer.id} value={chofer.id}>{chofer.nombre}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-md hover:shadow-lg transition"
              >
                {submitting ? 'Creando...' : '🚀 Crear Ruta'}
              </button>
            </form>
          </div>
        </div>

        {/* Listado de rutas */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🛣️</span>
                Rutas Creadas
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ruta</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bus</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chofer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRutas.map((ruta) => (
                    <tr key={ruta.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-bold text-gray-900">
                          {ruta.frecuencia.origen} - {ruta.frecuencia.destino}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {ruta.frecuencia.hora} • {ruta.frecuencia.tipoViaje === 'DIRECTO' ? '🚀 Directo' : '🚌 Con Paradas'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-semibold text-gray-900">Bus {ruta.bus.numero}</div>
                        <div className="text-gray-500 text-xs">{ruta.bus.placa} • {ruta.bus.marca}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(ruta.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                        {ruta.precio ? `$${ruta.precio.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {ruta.chofer?.nombre || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/rutas/editar/${ruta.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold mr-4">
                          ✏️ Editar
                        </Link>
                        <button onClick={() => handleEliminar(ruta)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold">
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rutas.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-5xl mb-3 block">🛣️</span>
                  <p className="text-gray-500 text-lg">No hay rutas creadas</p>
                  <p className="text-gray-400 text-sm mt-1">Crea una nueva ruta para comenzar</p>
                </div>
              )}
            </div>

            {rutas.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={rutas.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}