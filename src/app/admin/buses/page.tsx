'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SeatSelector from '@/components/SeatSelector'
import { TableSkeleton } from '@/components/Skeleton'
import Pagination from '@/components/Pagination'

interface Bus {
  id: string
  numero: string
  placa: string
  chasis: string
  carroceria: string
  marca: string
  capacidad: number
  asientosVIP: number
  asientosVIPNumeros?: string
  fotoUrl?: string | null
  activo: boolean
}

export default function BusesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [showAgregarModal, setShowAgregarModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [busSeleccionado, setBusSeleccionado] = useState<Bus | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    numero: '',
    placa: '',
    chasis: '',
    carroceria: '',
    marca: '',
    capacidad: '',
    asientosVIP: '',
    asientosVIPNumeros: '',
    fotoUrl: ''
  })
  const [selectedVIPSeats, setSelectedVIPSeats] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const cargarBuses = useCallback(async () => {
    try {
      const response = await fetch('/api/buses')
      if (response.ok) {
        const data = await response.json()
        setBuses(data)
      } else {
        setError('Error al cargar los buses')
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
      await cargarBuses()
    }

    void iniciarCarga()
  }, [session, router, cargarBuses])

  const resetForm = () => {
    setFormData({
      numero: '',
      placa: '',
      chasis: '',
      carroceria: '',
      marca: '',
      capacidad: '',
      asientosVIP: '',
      asientosVIPNumeros: '',
      fotoUrl: ''
    })
    setSelectedVIPSeats([])
    setError('')
    setSuccess('')
  }

  const handleAgregar = () => {
    resetForm()
    setShowAgregarModal(true)
  }

  const handleEditar = (bus: Bus) => {
    setBusSeleccionado(bus)
    const vipSeatsArray = bus.asientosVIPNumeros 
      ? bus.asientosVIPNumeros.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
      : []
    setSelectedVIPSeats(vipSeatsArray)
    setFormData({
      numero: bus.numero,
      placa: bus.placa,
      chasis: bus.chasis,
      carroceria: bus.carroceria,
      marca: bus.marca,
      capacidad: bus.capacidad.toString(),
      asientosVIP: bus.asientosVIP.toString(),
      asientosVIPNumeros: bus.asientosVIPNumeros || '',
      fotoUrl: bus.fotoUrl || ''
    })
    setShowEditarModal(true)
  }

  const handleSubmit = async (e: React.FormEvent, esEdicion: boolean = false) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const url = esEdicion ? `/api/buses/${busSeleccionado?.id}` : '/api/buses'
      const method = esEdicion ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacidad: parseInt(formData.capacidad),
          asientosVIP: selectedVIPSeats.length,
          asientosVIPNumeros: selectedVIPSeats.sort((a, b) => a - b).join(','),
        }),
      })
      if (response.ok) {
        setSuccess(esEdicion ? 'Bus actualizado correctamente' : 'Bus creado correctamente')
        setShowAgregarModal(false)
        setShowEditarModal(false)
        resetForm()
        cargarBuses()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al procesar la solicitud')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleEliminar = async (bus: Bus) => {
    const action = bus.activo ? 'desactivar' : 'activar'
    if (!confirm(`¿Estás seguro de ${action} el bus ${bus.numero}?`)) return
    try {
      const response = await fetch(`/api/buses/${bus.id}`, { method: 'DELETE' })
      if (response.ok) {
        setSuccess(`Bus ${action}do correctamente`)
        cargarBuses()
      } else {
        const errorData = await response.json()
        setError(errorData.error || `Error al ${action} el bus`)
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  if (loading) {
    return <TableSkeleton rows={5} />
  }

  // Calculate pagination
  const totalPages = Math.ceil(buses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBuses = buses.slice(startIndex, endIndex)

  return (
    <div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Buses</h1>
          <button
            onClick={handleAgregar}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
          >
            <span className="text-xl">+</span>
            Agregar Bus
          </button>
        </div>

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

      <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Número</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Placa</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Capacidad</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asientos VIP</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Marca</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBuses.map((bus) => (
                <tr key={bus.id} className={!bus.activo ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50 transition'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{bus.numero}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{bus.placa}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{bus.capacidad}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{bus.asientosVIP}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{bus.marca}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${bus.activo ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                      {bus.activo ? '✅ En servicio' : '❌ Fuera de servicio'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/buses/editar/${bus.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold mr-4">
                      ✏️ Editar
                    </Link>
                    {bus.activo ? (
                      <button onClick={() => handleEliminar(bus)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold">
                        🗑️ Desactivar
                      </button>
                    ) : (
                      <button onClick={() => handleEliminar(bus)} className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold">
                        ✅ Activar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {buses.length === 0 && (
            <div className="text-center py-12">
              <span className="text-5xl mb-3 block">🚌</span>
              <p className="text-gray-500 text-lg">No hay buses registrados</p>
              <p className="text-gray-400 text-sm mt-1">Agrega un nuevo bus para comenzar</p>
            </div>
          )}
        </div>

        {buses.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={buses.length}
          />
        )}
      </div>

      {/* Modales - igual que antes */}
      {showAgregarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border border-gray-200 w-96 shadow-xl rounded-xl bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">➕</span>
              Agregar Nuevo Bus
            </h3>
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número *</label>
                <input type="text" required value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Placa *</label>
                <input type="text" required value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chasis</label>
                <input type="text" value={formData.chasis} onChange={(e) => setFormData({ ...formData, chasis: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Carrocería</label>
                <input type="text" value={formData.carroceria} onChange={(e) => setFormData({ ...formData, carroceria: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
                <input type="text" value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Capacidad *</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  value={formData.capacidad} 
                  onChange={(e) => {
                    setFormData({ ...formData, capacidad: e.target.value })
                    setSelectedVIPSeats([])
                  }} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              {formData.capacidad && parseInt(formData.capacidad) > 0 && (
                <SeatSelector
                  capacidad={parseInt(formData.capacidad)}
                  selectedVIPSeats={selectedVIPSeats}
                  onSeatToggle={(seatNumber) => {
                    setSelectedVIPSeats(prev => 
                      prev.includes(seatNumber) 
                        ? prev.filter(s => s !== seatNumber)
                        : [...prev, seatNumber]
                    )
                  }}
                />
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Foto URL</label>
                <input type="url" value={formData.fotoUrl} onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAgregarModal(false)} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-semibold">Cancelar</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md">Agregar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditarModal && busSeleccionado && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border border-gray-200 w-96 shadow-xl rounded-xl bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">✏️</span>
              Editar Bus
            </h3>
            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
              {/* mismos campos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número *</label>
                <input type="text" required value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Placa *</label>
                <input type="text" required value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chasis</label>
                <input type="text" value={formData.chasis} onChange={(e) => setFormData({ ...formData, chasis: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Carrocería</label>
                <input type="text" value={formData.carroceria} onChange={(e) => setFormData({ ...formData, carroceria: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
                <input type="text" value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Capacidad *</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  value={formData.capacidad} 
                  onChange={(e) => {
                    setFormData({ ...formData, capacidad: e.target.value })
                    setSelectedVIPSeats([])
                  }} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              {formData.capacidad && parseInt(formData.capacidad) > 0 && (
                <SeatSelector
                  capacidad={parseInt(formData.capacidad)}
                  selectedVIPSeats={selectedVIPSeats}
                  onSeatToggle={(seatNumber) => {
                    setSelectedVIPSeats(prev => 
                      prev.includes(seatNumber) 
                        ? prev.filter(s => s !== seatNumber)
                        : [...prev, seatNumber]
                    )
                  }}
                />
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Foto URL</label>
                <input type="url" value={formData.fotoUrl} onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEditarModal(false)} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-semibold">Cancelar</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md">Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
