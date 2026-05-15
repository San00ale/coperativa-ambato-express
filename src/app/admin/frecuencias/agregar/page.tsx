'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

export default function AgregarFrecuenciaPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    hora: '',
    tipoViaje: 'DIRECTO' as 'DIRECTO' | 'CON_PARADAS',
    paradas: ['']
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    setLoading(true)
    setError('')

    try {
      const payload = {
        origen: formData.origen.trim(),
        destino: formData.destino.trim(),
        hora: formData.hora,
        tipoViaje: formData.tipoViaje,
        paradas: formData.tipoViaje === 'CON_PARADAS' 
          ? formData.paradas.filter(p => p.trim() !== '')
          : []
      }

      const response = await fetch('/api/frecuencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push('/admin/frecuencias')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al crear la frecuencia')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (session?.user?.role !== 'ADMIN') {
    router.push('/login')
    return null
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
            <h1 className="text-2xl font-bold">Agregar Frecuencia</h1>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DIRECTO">Directo</option>
                  <option value="CON_PARADAS">Con Paradas</option>
                </select>
              </div>
            </div>

            {formData.tipoViaje === 'CON_PARADAS' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paradas Intermedias
                </label>
                <div className="space-y-2">
                  {formData.paradas.map((parada, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={parada}
                        onChange={(e) => handleParadaChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Parada ${index + 1}`}
                      />
                      {formData.paradas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => quitarParada(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={agregarParada}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    + Agregar Parada
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/frecuencias"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Frecuencia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
