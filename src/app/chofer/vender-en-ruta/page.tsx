'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { AlertCircle, Loader, Bus, Ticket, Credit2, DollarSign, CheckCircle2 } from 'lucide-react'
import AsientosGrid from '@/components/AsientosGrid'

interface Bus {
  id: string
  numero: string
  placa: string
  marca: string
  carroceria: string
  asientosNormales: number
  asientosVIP: number
  capacidad: number
}

interface Ruta {
  id: string
  fecha: string
  completada: boolean
  frecuencia: {
    origen: string
    destino: string
    hora: string
    tipoViaje: string
    paradas: Array<{
      id: string
      ciudad: string
      orden: number
    }>
  }
  bus: Bus
  boletos: Array<{
    id: string
    asiento: string
    estado: string
  }>
}

interface FormData {
  nombre: string
  cedula: string
  tipo: 'ADULTO' | 'MENOR' | 'TERCERA_EDAD' | 'DISCAPACITADO'
  metodoPago: 'EFECTIVO' | 'TARJETA'
  asiento: string
}
export default function VenderEnRutaPage() {
  const { data: session } = useSession()
  const [ruta, setRuta] = useState<Ruta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [asientoSeleccionado, setAsientoSeleccionado] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    cedula: '',
    tipo: 'ADULTO',
    metodoPago: 'EFECTIVO',
    asiento: ''
  })

  useEffect(() => {
    const fetchRuta = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obtener la fecha actual en formato ISO
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const fechaFormato = today.toISOString().split('T')[0]

        // Obtener rutas del día
        const response = await fetch(`/api/rutas?fecha=${fechaFormato}`)

        if (!response.ok) {
          throw new Error('Error al obtener las rutas')
        }

        const rutas = await response.json()

        // Si hay rutas, seleccionar la primera (la ruta actual del chofer)
        if (rutas.length > 0) {
          setRuta(rutas[0])
        } else {
          setError('No tienes rutas asignadas para hoy')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Error fetching ruta:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRuta()
  }, [])

  const asientosOcupados = ruta?.boletos.map(b => b.asiento) || []

  const handleAsientoClick = (asiento: string) => {
    if (!asientosOcupados.includes(asiento)) {
      setAsientoSeleccionado(asiento)
      setFormData(prev => ({ ...prev, asiento }))
    }
  }

  const validarFormulario = (): boolean => {
    if (!formData.nombre.trim()) {
      setError('El nombre del pasajero es requerido')
      return false
    }
    if (!formData.cedula.trim()) {
      setError('La cédula es requerida')
      return false
    }
    if (!asientoSeleccionado) {
      setError('Debes seleccionar un asiento')
      return false
    }
    return true
  }

  const handleEmitirBoleto = async () => {
    if (!validarFormulario() || !ruta) {
      return
    }

    try {
      setEnviando(true)
      setError(null)

      const response = await fetch('/api/ventas-chofer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rutaId: ruta.id,
          nombre: formData.nombre,
          cedula: formData.cedula,
          tipoPasajero: formData.tipo,
          asiento: formData.asiento,
          metodoPago: formData.metodoPago,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al emitir el boleto')
      }

      const boleto = await response.json()

      // Mostrar mensaje de éxito
      setMensajeExito(`✓ Boleto emitido exitosamente para ${formData.nombre}`)
      
      // Actualizar la ruta para mostrar el nuevo asiento ocupado
      setRuta(prev => {
        if (!prev) return prev
        return {
          ...prev,
          boletos: [
            ...prev.boletos,
            {
              id: boleto.id,
              asiento: formData.asiento,
              estado: 'APROBADO'
            }
          ]
        }
      })

      // Limpiar formulario
      setFormData({
        nombre: '',
        cedula: '',
        tipo: 'ADULTO',
        metodoPago: 'EFECTIVO',
        asiento: ''
      })
      setAsientoSeleccionado(null)

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensajeExito(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al emitir el boleto')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600 mt-4">Cargando ruta...</p>
        </div>
      </div>
    )
  }

  if (!ruta) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="font-semibold text-red-900 text-lg">
          {error || 'No hay ruta activa'}
        </h3>
        <p className="text-red-700 mt-2">
          Debes tener una ruta asignada para vender boletos
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Ticket className="w-8 h-8 text-blue-600" />
          Vender Boletos en Ruta
        </h1>
        <p className="text-gray-600 mt-2">
          Vende boletos a bordo del bus a los pasajeros
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {mensajeExito && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-in">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Boleto Emitido</h3>
            <p className="text-green-700 text-sm">{mensajeExito}</p>
          </div>
        </div>
      )}

      {/* Ruta Actual */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bus className="w-5 h-5" />
          Ruta Actual
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-600">Recorrido</span>
            <p className="font-bold text-gray-900">
              {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Bus</span>
            <p className="font-bold text-gray-900">{ruta.bus.numero}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Placa</span>
            <p className="font-bold text-gray-900 uppercase">{ruta.bus.placa}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Capacidad</span>
            <p className="font-bold text-gray-900">
              {ruta.boletos.length} / {ruta.bus.capacidad} ocupados
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Asientos - Columna Izquierda */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Selecciona un Asiento</h2>
            
            {/* Leyenda */}
            <div className="flex gap-6 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded"></div>
                <span className="text-sm text-gray-700">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 border-2 border-red-500 rounded"></div>
                <span className="text-sm text-gray-700">Ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 border-2 border-blue-500 rounded"></div>
                <span className="text-sm text-gray-700">Seleccionado</span>
              </div>
            </div>

            {/* Grid de Asientos */}
            <AsientosGrid
              capacidad={ruta.bus.capacidad}
              asientosVIP={ruta.bus.asientosVIP}
              asientosOcupados={asientosOcupados}
              asientoSeleccionado={asientoSeleccionado}
              onAsientoClick={handleAsientoClick}
            />
          </div>
        </div>

        {/* Formulario - Columna Derecha */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Datos del Pasajero</h2>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Juan García"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Cédula */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Número de Cédula
                </label>
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData(prev => ({ ...prev, cedula: e.target.value }))}
                  placeholder="Ej: 1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tipo de Pasajero */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tipo de Pasajero
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as FormData['tipo'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ADULTO">Adulto</option>
                  <option value="MENOR">Menor de edad</option>
                  <option value="TERCERA_EDAD">Tercera edad</option>
                  <option value="DISCAPACITADO">Discapacitado</option>
                </select>
              </div>

              {/* Asiento Seleccionado */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Asiento Seleccionado
                </label>
                <div className={`w-full px-3 py-2 border-2 rounded-lg text-center font-bold ${
                  asientoSeleccionado
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-gray-50 text-gray-500'
                }`}>
                  {asientoSeleccionado || 'Selecciona un asiento'}
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Método de Pago
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    style={{ backgroundColor: formData.metodoPago === 'EFECTIVO' ? '#f0fdf4' : 'transparent' }}>
                    <input
                      type="radio"
                      value="EFECTIVO"
                      checked={formData.metodoPago === 'EFECTIVO'}
                      onChange={(e) => setFormData(prev => ({ ...prev, metodoPago: e.target.value as 'EFECTIVO' | 'TARJETA' }))}
                      className="w-4 h-4"
                    />
                    <span className="flex items-center gap-2 flex-1">
                      <DollarSign size={18} className="text-green-600" />
                      <span className="font-medium text-gray-900">Efectivo</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    style={{ backgroundColor: formData.metodoPago === 'TARJETA' ? '#f0fdf4' : 'transparent' }}>
                    <input
                      type="radio"
                      value="TARJETA"
                      checked={formData.metodoPago === 'TARJETA'}
                      onChange={(e) => setFormData(prev => ({ ...prev, metodoPago: e.target.value as 'EFECTIVO' | 'TARJETA' }))}
                      className="w-4 h-4"
                    />
                    <span className="flex items-center gap-2 flex-1">
                      <Credit2 size={18} className="text-blue-600" />
                      <span className="font-medium text-gray-900">Tarjeta</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Botón Emitir */}
              <button
                onClick={handleEmitirBoleto}
                disabled={enviando || !asientoSeleccionado}
                className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
              >
                {enviando ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Emitiendo...
                  </>
                ) : (
                  <>
                    <Ticket size={20} />
                    Emitir Boleto
                  </>
                )}
              </button>

              {/* Resumen */}
              {asientoSeleccionado && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Resumen</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Pasajero:</span>
                      <span className="font-medium text-gray-900">{formData.nombre || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Asiento:</span>
                      <span className="font-medium text-gray-900">{asientoSeleccionado}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="font-medium text-gray-900">{formData.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pago:</span>
                      <span className="font-medium text-gray-900">{formData.metodoPago}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
