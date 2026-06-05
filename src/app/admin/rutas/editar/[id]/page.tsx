'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

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

interface Ruta {
  id: string
  frecuenciaId: string
  busId: string
  fecha: string
  frecuencia: Frecuencia
  bus: Bus
}

export default function EditarRutaPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [ruta, setRuta] = useState<Ruta | null>(null)
  const [frecuencias, setFrecuencias] = useState<Frecuencia[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Formulario
  const [formData, setFormData] = useState({
    frecuenciaId: '',
    busId: '',
    fecha: ''
  })

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    const cargarDatos = async () => {
      try {
        const rutaResponse = await fetch(`/api/rutas`)
        if (rutaResponse.ok) {
          const rutasData = await rutaResponse.json()
          const rutaEncontrada = rutasData.find((r: Ruta) => r.id === id)
          
          if (rutaEncontrada) {
            setRuta(rutaEncontrada)
            setFormData({
              frecuenciaId: rutaEncontrada.frecuenciaId,
              busId: rutaEncontrada.busId,
              fecha: rutaEncontrada.fecha.split('T')[0]
            })
          } else {
            setError('Ruta no encontrada')
          }
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
      } catch (error) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      void cargarDatos()
    }
  }, [session, router, id])

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/rutas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frecuenciaId: formData.frecuenciaId,
          busId: formData.busId,
          fecha: formData.fecha,
        }),
      })

      if (response.ok) {
        setSuccess('Ruta actualizada correctamente')
        setTimeout(() => {
          router.push('/admin/rutas')
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al actualizar la ruta')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
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
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              href="/admin/rutas"
              className="text-blue-600 hover:text-blue-800 mr-4"
            >
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold">Editar Ruta</h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="frecuenciaId" className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia *
              </label>
              <select
                id="frecuenciaId"
                name="frecuenciaId"
                value={formData.frecuenciaId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Seleccionar frecuencia...</option>
                {frecuencias.map((frecuencia) => (
                  <option key={frecuencia.id} value={frecuencia.id}>
                    {frecuencia.origen} - {frecuencia.destino} ({frecuencia.hora})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="busId" className="block text-sm font-medium text-gray-700 mb-2">
                Bus *
              </label>
              <select
                id="busId"
                name="busId"
                value={formData.busId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Seleccionar bus...</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    Bus {bus.numero} ({bus.placa}) - {bus.marca}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/rutas"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Actualizando...' : 'Actualizar Ruta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
