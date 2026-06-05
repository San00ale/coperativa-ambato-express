'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/components/AdminHeader'

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
  estado: string
}

export default function RutasPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [frecuencias, setFrecuencias] = useState<Frecuencia[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [choferes, setChoferes] = useState<Chofer[]>([])   // ← nuevo
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')

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
      let url = '/api/rutas'
      if (filtroFecha) {
        url += `?fecha=${filtroFecha}`
      }
      
      const rutasResponse = await fetch(url)
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
  }, [filtroFecha])

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
        setFiltroFecha('') // Limpiar filtro para mostrar la nueva ruta
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
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <AdminHeader title="Gestión de Rutas" />
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de creación */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Crear Nueva Ruta</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="frecuenciaId" className="block text-sm font-medium text-gray-700 mb-2">Frecuencia *</label>
                <select
                  id="frecuenciaId"
                  name="frecuenciaId"
                  value={formData.frecuenciaId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Seleccionar frecuencia...</option>
                  {frecuencias.map(f => (
                    <option key={f.id} value={f.id}>{f.origen} - {f.destino} ({f.hora})</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="busId" className="block text-sm font-medium text-gray-700 mb-2">Bus *</label>
                <select
                  id="busId"
                  name="busId"
                  value={formData.busId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Seleccionar bus...</option>
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>Bus {b.numero} ({b.placa}) - {b.marca}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                  min={fechaMinima}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">Precio ($) *</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Ej: 5.00"
                />
              </div>

              {/* Selector de chofer (opcional) */}
              <div>
                <label htmlFor="choferId" className="block text-sm font-medium text-gray-700 mb-2">Chofer (opcional)</label>
                <select
                  id="choferId"
                  name="choferId"
                  value={formData.choferId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creando...' : 'Crear Ruta'}
              </button>
            </form>
          </div>
        </div>

        {/* Listado de rutas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Rutas Creadas</h2>
                <div className="flex items-center gap-2">
                  <label htmlFor="filtroFecha" className="text-sm font-medium text-gray-700">Filtrar por fecha:</label>
                  <input
                    type="date"
                    id="filtroFecha"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  {filtroFecha && (
                    <button
                      onClick={() => setFiltroFecha('')}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chofer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rutas.map((ruta) => (
                    <tr key={ruta.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">
                          {ruta.frecuencia.origen} - {ruta.frecuencia.destino}
                        </div>
                        <div className="text-gray-500">
                          {ruta.frecuencia.hora} • {ruta.frecuencia.tipoViaje === 'DIRECTO' ? 'Directo' : 'Con Paradas'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">Bus {ruta.bus.numero}</div>
                        <div className="text-gray-500">{ruta.bus.placa} • {ruta.bus.marca}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(ruta.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ruta.precio ? `$${ruta.precio.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ruta.chofer?.nombre || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ruta.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          ruta.estado === 'en_curso' ? 'bg-green-100 text-green-800' :
                          ruta.estado === 'completada' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ruta.estado === 'pendiente' ? 'Pendiente' :
                           ruta.estado === 'en_curso' ? 'En curso' :
                           ruta.estado === 'completada' ? 'Completada' :
                           ruta.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/rutas/editar/${ruta.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</Link>
                        <button onClick={() => handleEliminar(ruta)} className="text-red-600 hover:text-red-900">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rutas.length === 0 && <div className="text-center py-8 text-gray-500">No hay rutas creadas</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}