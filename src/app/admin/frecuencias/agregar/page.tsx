'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AgregarFrecuenciaPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    hora: '',
    tipoViaje: 'DIRECTO' as 'DIRECTO' | 'CON_PARADAS',
    paradas: [''],
    duracion: ''          // ← nuevo campo
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
          : [],
        duracion: formData.duracion ? parseInt(formData.duracion) : undefined
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
    <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/frecuencias"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Agregar Frecuencia</h1>
          </div>
        </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="origen" className="block text-sm font-semibold text-gray-700 mb-2">
                    Origen *
                  </label>
                  <input
                    type="text"
                    id="origen"
                    name="origen"
                    value={formData.origen}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="Ej: Ambato"
                  />
                </div>

                <div>
                  <label htmlFor="destino" className="block text-sm font-semibold text-gray-700 mb-2">
                    Destino *
                  </label>
                  <input
                    type="text"
                    id="destino"
                    name="destino"
                    value={formData.destino}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="Ej: Quito"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="hora" className="block text-sm font-semibold text-gray-700 mb-2">
                    Hora *
                  </label>
                  <input
                    type="time"
                    id="hora"
                    name="hora"
                    value={formData.hora}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="tipoViaje" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Viaje
                  </label>
                  <select
                    id="tipoViaje"
                    name="tipoViaje"
                    value={formData.tipoViaje}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  >
                    <option value="DIRECTO">🚀 Directo</option>
                    <option value="CON_PARADAS">🚌 Con Paradas</option>
                  </select>
                </div>
              </div>

              {/* Campo Duración (nuevo) */}
              <div>
                <label htmlFor="duracion" className="block text-sm font-semibold text-gray-700 mb-2">
                  Duración (minutos, opcional)
                </label>
                <input
                  type="number"
                  id="duracion"
                  name="duracion"
                  min="0"
                  step="1"
                  value={formData.duracion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="Ej: 120"
                />
              </div>

              {formData.tipoViaje === 'CON_PARADAS' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paradas Intermedias
                  </label>
                  <div className="space-y-3">
                    {formData.paradas.map((parada, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={parada}
                          onChange={(e) => handleParadaChange(index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Parada ${index + 1}`}
                        />
                        {formData.paradas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => quitarParada(index)}
                            className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold"
                          >
                            🗑️ Quitar
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={agregarParada}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold shadow-md"
                    >
                      + Agregar Parada
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <Link
                  href="/admin/frecuencias"
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 font-semibold"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-md"
                >
                  {loading ? 'Guardando...' : '🚀 Guardar Frecuencia'}
                </button>
              </div>
            </form>
        </div>
    </div>
  )
}