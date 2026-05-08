'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Bus {
  id: string
  numero: string
  placa: string
  chasis: string
  carroceria: string
  marca: string
  capacidad: number
  asientosVIP: number
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

  // Formulario
  const [formData, setFormData] = useState({
    numero: '',
    placa: '',
    chasis: '',
    carroceria: '',
    marca: '',
    capacidad: '',
    asientosVIP: '',
    fotoUrl: ''
  })

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    cargarBuses()
  }, [session, router])

  const cargarBuses = async () => {
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
  }

  const resetForm = () => {
    setFormData({
      numero: '',
      placa: '',
      chasis: '',
      carroceria: '',
      marca: '',
      capacidad: '',
      asientosVIP: '',
      fotoUrl: ''
    })
    setError('')
    setSuccess('')
  }

  const handleAgregar = () => {
    resetForm()
    setShowAgregarModal(true)
  }

  const handleEditar = (bus: Bus) => {
    setBusSeleccionado(bus)
    setFormData({
      numero: bus.numero,
      placa: bus.placa,
      chasis: bus.chasis,
      carroceria: bus.carroceria,
      marca: bus.marca,
      capacidad: bus.capacidad.toString(),
      asientosVIP: bus.asientosVIP.toString(),
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
      
      console.log('API Call:', { url, method, data: formData })
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacidad: parseInt(formData.capacidad),
          asientosVIP: formData.asientosVIP ? parseInt(formData.asientosVIP) : 0,
        }),
      })
      console.log('API Response:', response.status, await response.clone().json())

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
    if (!confirm(`¿Estás seguro de ${action} el bus ${bus.numero}?`)) {
      return
    }

    try {
      console.log('DELETE API Call:', { url: `/api/buses/${bus.id}` })
      const response = await fetch(`/api/buses/${bus.id}`, {
        method: 'DELETE',
      })

      console.log('DELETE Response:', response.status, await response.clone().json())
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
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Buses</h1>
        <button
          onClick={handleAgregar}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Agregar Bus
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Placa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asientos VIP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {buses.map((bus) => (
              <tr key={bus.id} className={!bus.activo ? 'opacity-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {bus.numero}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bus.placa}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bus.capacidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bus.asientosVIP}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bus.marca}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    bus.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {bus.activo ? 'En servicio' : 'Fuera de servicio'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditar(bus)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  {bus.activo ? (
                    <button
                      onClick={() => handleEliminar(bus)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEliminar(bus)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Activar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {buses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay buses registrados
          </div>
        )}
      </div>

      {/* Modal Agregar */}
      {showAgregarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nuevo Bus</h3>
              <form onSubmit={(e) => handleSubmit(e, false)}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chasis
                  </label>
                  <input
                    type="text"
                    value={formData.chasis}
                    onChange={(e) => setFormData({ ...formData, chasis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carrocería
                  </label>
                  <input
                    type="text"
                    value={formData.carroceria}
                    onChange={(e) => setFormData({ ...formData, carroceria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidad *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacidad}
                    onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asientos VIP
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.asientosVIP}
                    onChange={(e) => setFormData({ ...formData, asientosVIP: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto URL
                  </label>
                  <input
                    type="url"
                    value={formData.fotoUrl}
                    onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAgregarModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Agregar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditarModal && busSeleccionado && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Bus</h3>
              <form onSubmit={(e) => handleSubmit(e, true)}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chasis
                  </label>
                  <input
                    type="text"
                    value={formData.chasis}
                    onChange={(e) => setFormData({ ...formData, chasis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carrocería
                  </label>
                  <input
                    type="text"
                    value={formData.carroceria}
                    onChange={(e) => setFormData({ ...formData, carroceria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidad *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacidad}
                    onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asientos VIP
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.asientosVIP}
                    onChange={(e) => setFormData({ ...formData, asientosVIP: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto URL
                  </label>
                  <input
                    type="url"
                    value={formData.fotoUrl}
                    onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditarModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}