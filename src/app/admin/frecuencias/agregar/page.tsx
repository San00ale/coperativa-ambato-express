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
    paradas: [''],
    duracion: '',
    precioBase: '',
    opcionPrecio: 'MISMO' as 'MISMO' | 'POR_TRAMO',
    preciosPorTramo: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Si cambia a DIRECTO, limpiar paradas y precios
    if (name === 'tipoViaje' && value === 'DIRECTO') {
      setFormData(prev => ({
        ...prev,
        paradas: [''],
        opcionPrecio: 'MISMO',
        preciosPorTramo: []
      }))
    }

    // Si cambia a CON_PARADAS, inicializar preciosPorTramo si hay paradas
    if (name === 'tipoViaje' && value === 'CON_PARADAS') {
      const paradasValidas = formData.paradas.filter(p => p.trim() !== '')
      if (paradasValidas.length > 0) {
        const numTramos = paradasValidas.length + 1
        setFormData(prev => ({
          ...prev,
          preciosPorTramo: Array(numTramos).fill('')
        }))
      }
    }
  }

  const handleOpcionPrecioChange = (opcion: 'MISMO' | 'POR_TRAMO') => {
    setFormData(prev => ({
      ...prev,
      opcionPrecio: opcion
    }))

    // Si cambia a POR_TRAMO, inicializar preciosPorTramo
    if (opcion === 'POR_TRAMO') {
      const paradasValidas = formData.paradas.filter(p => p.trim() !== '')
      const numTramos = paradasValidas.length + 1
      setFormData(prev => ({
        ...prev,
        preciosPorTramo: Array(numTramos).fill('')
      }))
    }
  }

  const handlePrecioTramoChange = (index: number, value: string) => {
    const newPrecios = [...formData.preciosPorTramo]
    newPrecios[index] = value
    setFormData(prev => ({
      ...prev,
      preciosPorTramo: newPrecios
    }))
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
    setFormData(prev => {
      const newParadas = [...prev.paradas, '']
      // Si está en modo POR_TRAMO, agregar un precio adicional
      const newPrecios = prev.opcionPrecio === 'POR_TRAMO' 
        ? [...prev.preciosPorTramo, '']
        : prev.preciosPorTramo
      return {
        ...prev,
        paradas: newParadas,
        preciosPorTramo: newPrecios
      }
    })
  }

  const quitarParada = (index: number) => {
    setFormData(prev => {
      const newParadas = prev.paradas.filter((_, i) => i !== index)
      // Si está en modo POR_TRAMO, quitar un precio
      const newPrecios = prev.opcionPrecio === 'POR_TRAMO'
        ? prev.preciosPorTramo.filter((_, i) => i !== index)
        : prev.preciosPorTramo
      return {
        ...prev,
        paradas: newParadas,
        preciosPorTramo: newPrecios
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload: any = {
        origen: formData.origen.trim(),
        destino: formData.destino.trim(),
        hora: formData.hora,
        tipoViaje: formData.tipoViaje,
        paradas: formData.tipoViaje === 'CON_PARADAS'
          ? formData.paradas.filter(p => p.trim() !== '')
          : [],
        duracion: formData.duracion ? parseInt(formData.duracion) : undefined,
        precioBase: formData.precioBase ? parseFloat(formData.precioBase) : undefined
      }

      // Si es CON_PARADAS y opción es POR_TRAMO, agregar preciosPorTramo
      if (formData.tipoViaje === 'CON_PARADAS' && formData.opcionPrecio === 'POR_TRAMO') {
        const paradasValidas = formData.paradas.filter(p => p.trim() !== '')
        const tramos = paradasValidas.map((parada, index) => {
          if (index === 0) {
            return { origen: formData.origen, destino: parada, precio: parseFloat(formData.preciosPorTramo[index]) || 0 }
          } else if (index === paradasValidas.length - 1) {
            return { origen: paradasValidas[index - 1], destino: formData.destino, precio: parseFloat(formData.preciosPorTramo[index]) || 0 }
          } else {
            return { origen: paradasValidas[index - 1], destino: parada, precio: parseFloat(formData.preciosPorTramo[index]) || 0 }
          }
        })
        // Agregar último tramo: última parada → destino
        if (paradasValidas.length > 0) {
          tramos.push({ 
            origen: paradasValidas[paradasValidas.length - 1], 
            destino: formData.destino, 
            precio: parseFloat(formData.preciosPorTramo[formData.preciosPorTramo.length - 1]) || 0 
          })
        }
        payload.preciosPorTramo = tramos
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

            {/* Campo Duración (nuevo) */}
            <div>
              <label htmlFor="duracion" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="Ej: 120"
              />
            </div>

            {/* Campo Precio Base */}
            <div>
              <label htmlFor="precioBase" className="block text-sm font-medium text-gray-700 mb-2">
                Precio Base ($) {formData.tipoViaje === 'DIRECTO' ? '*' : '(opcional)'}
              </label>
              <input
                type="number"
                id="precioBase"
                name="precioBase"
                min="0"
                step="0.01"
                value={formData.precioBase}
                onChange={handleInputChange}
                required={formData.tipoViaje === 'DIRECTO'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="Ej: 5.00"
              />
              {formData.tipoViaje === 'DIRECTO' && (
                <p className="mt-1 text-xs text-gray-500">Obligatorio para viajes directos</p>
              )}
            </div>

            {/* Opción de precio para viajes con paradas */}
            {formData.tipoViaje === 'CON_PARADAS' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuración de Precios
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="opcionPrecio"
                      value="MISMO"
                      checked={formData.opcionPrecio === 'MISMO'}
                      onChange={() => handleOpcionPrecioChange('MISMO')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Mismo precio para todo el recorrido</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="opcionPrecio"
                      value="POR_TRAMO"
                      checked={formData.opcionPrecio === 'POR_TRAMO'}
                      onChange={() => handleOpcionPrecioChange('POR_TRAMO')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Precios por tramo</span>
                  </label>
                </div>
              </div>
            )}

            {/* Precios por tramo */}
            {formData.tipoViaje === 'CON_PARADAS' && formData.opcionPrecio === 'POR_TRAMO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precios por Tramo
                </label>
                <div className="space-y-2">
                  {formData.preciosPorTramo.map((precio, index) => {
                    const paradasValidas = formData.paradas.filter(p => p.trim() !== '')
                    let tramoLabel = ''
                    if (index === 0) {
                      tramoLabel = `${formData.origen} → ${paradasValidas[0] || 'primera parada'}`
                    } else if (index < paradasValidas.length) {
                      tramoLabel = `${paradasValidas[index - 1]} → ${paradasValidas[index]}`
                    } else {
                      tramoLabel = `${paradasValidas[paradasValidas.length - 1]} → ${formData.destino}`
                    }
                    return (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-sm text-gray-600 w-48">{tramoLabel}:</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={precio}
                          onChange={(e) => handlePrecioTramoChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                          placeholder="0.00"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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