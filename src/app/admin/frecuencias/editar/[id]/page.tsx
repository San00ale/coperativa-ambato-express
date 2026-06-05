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
  duracion?: number | null
  precioBase?: number | null
  preciosPorTramo?: string | null
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
    paradas: [''],
    duracion: '',
    precioBase: '',
    opcionPrecio: 'MISMO' as 'MISMO' | 'POR_TRAMO',
    preciosPorTramo: [] as string[]
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    const cargarFrecuencia = async () => {
      try {
        const response = await fetch('/api/frecuencias')
        if (response.ok) {
          const frecuencias = await response.json()
          const frecuencia = frecuencias.find((f: Frecuencia) => f.id === id)
          if (frecuencia) {
            // Parse preciosPorTramo si existe
            let preciosPorTramoParsed: string[] = []
            if (frecuencia.preciosPorTramo) {
              try {
                const parsed = JSON.parse(frecuencia.preciosPorTramo)
                preciosPorTramoParsed = parsed.map((p: any) => p.precio?.toString() || '')
              } catch {
                preciosPorTramoParsed = []
              }
            }

            setFormData({
              origen: frecuencia.origen,
              destino: frecuencia.destino,
              hora: frecuencia.hora,
              tipoViaje: frecuencia.tipoViaje,
              paradas: frecuencia.paradas && frecuencia.paradas.length > 0
                ? frecuencia.paradas.map((p: Parada) => p.ciudad)
                : [''],
              duracion: frecuencia.duracion?.toString() || '',
              precioBase: frecuencia.precioBase?.toString() || '',
              opcionPrecio: preciosPorTramoParsed.length > 0 ? 'POR_TRAMO' : 'MISMO',
              preciosPorTramo: preciosPorTramoParsed
            })
          } else {
            setError('Frecuencia no encontrada')
          }
        } else {
          setError('Error al cargar la frecuencia')
        }
      } catch {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }
    if (id) void cargarFrecuencia()
  }, [session, router, id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'tipoViaje' && value === 'DIRECTO') {
      setFormData(prev => ({
        ...prev,
        paradas: [''],
        opcionPrecio: 'MISMO',
        preciosPorTramo: []
      }))
    }

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
    setFormData(prev => ({ ...prev, opcionPrecio: opcion }))
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
    setFormData(prev => ({ ...prev, preciosPorTramo: newPrecios }))
    setValidationError('')
  }

  const handleParadaChange = (index: number, value: string) => {
    const newParadas = [...formData.paradas]
    newParadas[index] = value
    setFormData(prev => ({ ...prev, paradas: newParadas }))
  }

  const agregarParada = () => {
    if (formData.paradas.length === 0) {
      setFormData(prev => ({ ...prev, paradas: [''] }))
      return
    }
    const nuevaParada = formData.paradas[formData.paradas.length - 1]?.trim()
    if (!nuevaParada) {
      setValidationError('La parada no puede estar vacía')
      return
    }
    const paradasSinUltima = formData.paradas.slice(0, -1)
    const paradasNormalizadas = paradasSinUltima.map(p => p.trim().toLowerCase())
    if (paradasNormalizadas.includes(nuevaParada.toLowerCase())) {
      setValidationError('Esta ciudad ya está en la lista de paradas')
      return
    }
    setFormData(prev => ({ ...prev, paradas: [...prev.paradas, ''] }))
    setValidationError('')
  }

  const quitarParada = (index: number) => {
    setFormData(prev => ({
      ...prev,
      paradas: prev.paradas.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setValidationError('')

    const duracionNum = parseInt(formData.duracion)
    if (!formData.duracion || isNaN(duracionNum) || duracionNum < 1 || duracionNum > 720) {
      setValidationError('La duración debe ser un número entre 1 y 720 minutos')
      setSubmitting(false)
      return
    }

    if (formData.origen.trim().toLowerCase() === formData.destino.trim().toLowerCase()) {
      setValidationError('El origen y el destino no pueden ser la misma ciudad')
      setSubmitting(false)
      return
    }

    try {
      const payload: {
        origen: string
        destino: string
        hora: string
        tipoViaje: string
        activa: boolean
        duracion: number
        precioBase?: number
        preciosPorTramo?: Array<{ origen: string; destino: string; precio: number }>
      } = {
        origen: formData.origen.trim(),
        destino: formData.destino.trim(),
        hora: formData.hora,
        tipoViaje: formData.tipoViaje,
        activa: true,
        duracion: duracionNum,
        precioBase: formData.precioBase ? parseFloat(formData.precioBase) : undefined
      }

      if (formData.tipoViaje === 'CON_PARADAS' && formData.opcionPrecio === 'POR_TRAMO') {
        const paradasValidas = formData.paradas.filter(p => p.trim() !== '')
        const tramos: Array<{ origen: string; destino: string; precio: number }> = []
        if (paradasValidas.length > 0) {
          tramos.push({
            origen: formData.origen,
            destino: paradasValidas[0],
            precio: parseFloat(formData.preciosPorTramo[0]) || 0
          })
        }
        for (let i = 1; i < paradasValidas.length; i++) {
          tramos.push({
            origen: paradasValidas[i - 1],
            destino: paradasValidas[i],
            precio: parseFloat(formData.preciosPorTramo[i]) || 0
          })
        }
        if (paradasValidas.length > 0) {
          tramos.push({
            origen: paradasValidas[paradasValidas.length - 1],
            destino: formData.destino,
            precio: parseFloat(formData.preciosPorTramo[formData.preciosPorTramo.length - 1]) || 0
          })
        }
        payload.preciosPorTramo = tramos
      }

      const response = await fetch(`/api/frecuencias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push('/admin/frecuencias')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al actualizar la frecuencia')
      }
    } catch {
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
            <Link href="/admin/frecuencias" className="text-blue-600 hover:text-blue-800 mr-4">
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold">Editar Frecuencia</h1>
          </div>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
        {validationError && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{validationError}</div>}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="origen" className="block text-sm font-medium text-gray-700 mb-2">Origen *</label>
                <input
                  type="text" id="origen" name="origen" value={formData.origen} onChange={handleInputChange}
                  required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="Ej: Ambato"
                />
              </div>
              <div>
                <label htmlFor="destino" className="block text-sm font-medium text-gray-700 mb-2">Destino *</label>
                <input
                  type="text" id="destino" name="destino" value={formData.destino} onChange={handleInputChange}
                  required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="Ej: Quito"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-2">Hora *</label>
                <input
                  type="time" id="hora" name="hora" value={formData.hora} onChange={handleInputChange}
                  required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label htmlFor="tipoViaje" className="block text-sm font-medium text-gray-700 mb-2">Tipo de Viaje</label>
                <select
                  id="tipoViaje" name="tipoViaje" value={formData.tipoViaje} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                >
                  <option value="DIRECTO">Directo</option>
                  <option value="CON_PARADAS">Con Paradas</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="duracion" className="block text-sm font-medium text-gray-700 mb-2">Duración (minutos) *</label>
              <input
                type="number" id="duracion" name="duracion" min="1" max="720" step="5"
                value={formData.duracion} onChange={handleInputChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="Ej: 120"
              />
            </div>

            <div>
              <label htmlFor="precioBase" className="block text-sm font-medium text-gray-700 mb-2">
                Precio Base ($) {formData.tipoViaje === 'DIRECTO' ? '*' : '(opcional)'}
              </label>
              <input
                type="number" id="precioBase" name="precioBase" min="0" step="0.01"
                value={formData.precioBase} onChange={handleInputChange}
                required={formData.tipoViaje === 'DIRECTO'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="Ej: 5.00"
              />
              {formData.tipoViaje === 'DIRECTO' && (
                <p className="mt-1 text-xs text-gray-500">Obligatorio para viajes directos</p>
              )}
            </div>

            {formData.tipoViaje === 'CON_PARADAS' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Configuración de Precios</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio" name="opcionPrecio" value="MISMO"
                      checked={formData.opcionPrecio === 'MISMO'}
                      onChange={() => handleOpcionPrecioChange('MISMO')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Mismo precio para todo el recorrido</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio" name="opcionPrecio" value="POR_TRAMO"
                      checked={formData.opcionPrecio === 'POR_TRAMO'}
                      onChange={() => handleOpcionPrecioChange('POR_TRAMO')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Precios por tramo</span>
                  </label>
                </div>
              </div>
            )}

            {formData.tipoViaje === 'CON_PARADAS' && formData.opcionPrecio === 'POR_TRAMO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precios por Tramo</label>
                <div className="space-y-2">
                  {formData.preciosPorTramo.map((precio, idx) => {
                    const paradasValidas = formData.paradas.filter(p => p.trim() !== '')
                    let tramoLabel = ''
                    if (idx === 0) tramoLabel = `${formData.origen} → ${paradasValidas[0] || 'primera parada'}`
                    else if (idx < paradasValidas.length) tramoLabel = `${paradasValidas[idx - 1]} → ${paradasValidas[idx]}`
                    else tramoLabel = `${paradasValidas[paradasValidas.length - 1]} → ${formData.destino}`
                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-sm text-gray-600 w-48">{tramoLabel}:</span>
                        <input
                          type="number" min="0" step="0.01"
                          value={precio} onChange={(e) => handlePrecioTramoChange(idx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Para editar las paradas intermedias, elimina y vuelve a crear la frecuencia con las paradas actualizadas.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/frecuencias" className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                Cancelar
              </Link>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Actualizando...' : 'Actualizar Frecuencia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}