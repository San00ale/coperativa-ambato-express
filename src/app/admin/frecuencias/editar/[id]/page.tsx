'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface Parada {
  id: string
  ciudad: string
  orden: number
}

interface Frecuencia {
  id: string
  origen: string
  destino: string
  hora: string
  tipoViaje: 'DIRECTO' | 'CON_PARADAS'
  activa: boolean
  paradas: Parada[]
}

export default function EditarFrecuenciaPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    hora: '',
    tipoViaje: 'DIRECTO' as 'DIRECTO' | 'CON_PARADAS',
    paradas: ['']
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    if (id) {
      cargarFrecuencia()
    }
  }, [session, router, id])

  const cargarFrecuencia = async () => {
    try {
      const response = await fetch(`/api/frecuencias`)
      if (response.ok) {
        const frecuencias = await response.json()
        const frecuencia = frecuencias.find((f: Frecuencia) => f.id === id)
        
        if (frecuencia) {
          setFormData({
            origen: frecuencia.origen,
            destino: frecuencia.destino,
            hora: frecuencia.hora,
            tipoViaje: frecuencia.tipoViaje,
            paradas: frecuencia.paradas && frecuencia.paradas.length > 0 
              ? frecuencia.paradas.map((p: Parada) => p.ciudad)
              : ['']
          })
        } else {
          setError('Frecuencia no encontrada')
        }
      } else {
        setError('Error al cargar la frecuencia')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Si cambia a DIRECTO, limpiar paradas
    if (name === 'tipoViaje' && value === 'DIRECTO') {
      setFormData(prev => ({
        ...prev,
        paradas: ['']
      }))
    }
  }

  const handleParadaChange = (index: number, value: string) => {
    const newParadas = [...formData.paradas]
    newParadas[index] = value
    setFormData(prev => ({
      ...prev,
      paradas: newParadas
    }))
  }

  const agregarParada = () => {
    setFormData(prev => ({
      ...prev,
      paradas: [...prev.paradas, '']
    }))
  }

  const quitarParada = (index: number) => {
    const newParadas = formData.paradas.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      paradas: newParadas
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const payload = {
        origen: formData.origen.trim(),
        destino: formData.destino.trim(),
        hora: formData.hora,
        tipoViaje: formData.tipoViaje,
        activa: true
      }

      const response = await fetch(`/api/frecuencias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push('/admin/frecuencias')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al actualizar la frecuencia')
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
              href="/admin/frecuencias"
              className="text-blue-600 hover:text-blue-800 mr-4"
            >
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold">Editar Frecuencia</h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="origen" className="block text-sm font-medium text-gray-700 mb-2">
                  Origen *
                </label>
                <input
                  type="text"
                  id="origen"
                  name="origen"
                  value={formData.origen}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="Ej: Ambato"
                />
              </div>

              <div>
                <label htmlFor="destino" className="block text-sm font-medium text-gray-700 mb-2">
                  Destino *
                </label>
                <input
                  type="text"
                  id="destino"
                  name="destino"
                  value={formData.destino}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="Ej: Quito"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora *
                </label>
                <input
                  type="time"
                  id="hora"
                  name="hora"
                  value={formData.hora}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="tipoViaje" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Viaje
                </label>
                <select
                  id="tipoViaje"
                  name="tipoViaje"
                  value={formData.tipoViaje}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                >
                  <option value="DIRECTO">Directo</option>
                  <option value="CON_PARADAS">Con Paradas</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Para editar las paradas intermedias, elimina y vuelve a crear la frecuencia con las paradas actualizadas.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/frecuencias"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Actualizando...' : 'Actualizar Frecuencia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
