'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader, Bus, Ticket, DollarSign, CheckCircle2 } from 'lucide-react'
import AsientosGrid from '@/components/AsientosGrid'
import { validarCedulaEcuatoriana } from '@/lib/validations'

interface Bus {
  id: string
  numero: string
  placa: string
  marca: string
  carroceria: string
  asientosNormales: number
  asientosVIP: number
  asientosVIPNumeros?: string
  capacidad: number
}

interface Ruta {
  id: string
  fecha: string
  completada: boolean
  estado: string
  precio?: number
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
  metodoPago: 'EFECTIVO'
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
  const [fieldErrors, setFieldErrors] = useState({
    nombre: '',
    cedula: '',
    asiento: ''
  })

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

        const rutas = (await response.json()) as Ruta[]
        const rutasActivas = rutas.filter(
          (r) => !r.completada && r.estado !== 'completada'
        )

        // Si hay rutas activas, seleccionar la primera (la ruta actual del chofer)
        if (rutasActivas.length > 0) {
          setRuta(rutasActivas[0])
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

  const esVIP = (num: string): boolean => {
    if (!ruta) return false;
    const vipSeatsNumeros = ruta.bus.asientosVIPNumeros;
    if (vipSeatsNumeros) {
      const vipSeatsArray = vipSeatsNumeros.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      return vipSeatsArray.includes(parseInt(num));
    }
    const capacidad = ruta.bus.capacidad;
    const vipCount = ruta.bus.asientosVIP;
    return parseInt(num) > capacidad - vipCount;
  }

  const calcularPrecioFinal = useMemo(() => {
    const precioBase = ruta?.precio ?? 0
    let precio = precioBase

    if (asientoSeleccionado && esVIP(asientoSeleccionado)) {
      precio *= 1.2
    }

    if (['MENOR', 'TERCERA_EDAD', 'DISCAPACITADO'].includes(formData.tipo)) {
      precio *= 0.5
    }

    return Math.round(precio * 100) / 100
  }, [ruta?.precio, asientoSeleccionado, formData.tipo])

  const recargarRuta = async () => {
    if (!ruta) return

    const response = await fetch(`/api/rutas/${ruta.id}`)
    if (!response.ok) throw new Error('No se pudo recargar la ruta')

    const rutaActualizada = await response.json()
    setRuta(rutaActualizada)
  }

  const handleAsientoClick = (asiento: string) => {
    if (!asientosOcupados.includes(asiento)) {
      setAsientoSeleccionado(asiento)
      setFormData(prev => ({ ...prev, asiento }))
      setFieldErrors(prev => ({ ...prev, asiento: '' }))
    }
  }

  const validarFormulario = (): boolean => {
    const errores = {
      nombre: '',
      cedula: '',
      asiento: ''
    }

    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre completo es requerido'
    }
    if (!formData.cedula.trim()) {
      errores.cedula = 'La cédula es requerida'
    } else if (!validarCedulaEcuatoriana(formData.cedula)) {
      errores.cedula = 'Cédula ecuatoriana inválida'
    }
    if (!asientoSeleccionado) {
      errores.asiento = 'Debes seleccionar un asiento disponible'
    }

    setFieldErrors(errores)
    return !errores.nombre && !errores.cedula && !errores.asiento
  }

  const handleEmitirBoleto = async () => {
    if (!validarFormulario() || !ruta) {
      return
    }

    try {
      setEnviando(true)
      setError(null)

      const precioFinal = calcularPrecioFinal

      const response = await fetch('/api/boletos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rutaId: ruta.id,
          asiento: asientoSeleccionado,
          pasajeroNombre: formData.nombre,
          pasajeroCedula: formData.cedula,
          tipoPasajero: formData.tipo,
          precio: precioFinal,
          metodoPago: 'EFECTIVO',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al emitir el boleto')
      }

      await recargarRuta()

      setMensajeExito(`✓ Boleto emitido exitosamente para ${formData.nombre}`)

      // Limpiar formulario
      setFormData({
        nombre: '',
        cedula: '',
        tipo: 'ADULTO',
        metodoPago: 'EFECTIVO',
        asiento: ''
      })
      setAsientoSeleccionado(null)
      setFieldErrors({ nombre: '', cedula: '', asiento: '' })

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensajeExito(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al emitir el boleto')
    } finally {
      setEnviando(false)
    }
  }

  const formularioValido = Boolean(formData.nombre.trim() && formData.cedula.trim() && validarCedulaEcuatoriana(formData.cedula) && asientoSeleccionado)

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
    <div className="space-y-8 text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Ticket className="w-8 h-8 text-blue-600" />
          Vender Boletos en Ruta
        </h1>
        <p className="text-slate-300 mt-2">
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bus className="w-5 h-5" />
          Ruta Actual
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-slate-300">Recorrido</span>
            <p className="font-bold text-white">
              {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-300">Bus</span>
            <p className="font-bold text-white">{ruta.bus.numero}</p>
          </div>
          <div>
            <span className="text-sm text-slate-300">Placa</span>
            <p className="font-bold text-white uppercase">{ruta.bus.placa}</p>
          </div>
          <div>
            <span className="text-sm text-slate-300">Capacidad</span>
            <p className="font-bold text-white">
              {ruta.boletos.length} / {ruta.bus.capacidad} ocupados
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Asientos - Columna Izquierda */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-6">Selecciona un Asiento</h2>
            
            {/* Leyenda */}
            <div className="flex gap-6 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded"></div>
                <span className="text-sm text-slate-200">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 border-2 border-red-500 rounded"></div>
                <span className="text-sm text-slate-200">Ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 border-2 border-blue-500 rounded"></div>
                <span className="text-sm text-slate-200">Seleccionado</span>
              </div>
            </div>

            {/* Grid de Asientos */}
            <AsientosGrid
              capacidad={ruta.bus.capacidad}
              asientosVIP={ruta.bus.asientosVIP}
              asientosVIPNumeros={ruta.bus.asientosVIPNumeros}
              asientosOcupados={asientosOcupados}
              asientoSeleccionado={asientoSeleccionado}
              onAsientoClick={handleAsientoClick}
            />
          </div>
        </div>

        {/* Formulario - Columna Derecha */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-20 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-6">Datos del Pasajero</h2>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, nombre: e.target.value }))
                    setFieldErrors(prev => ({ ...prev, nombre: e.target.value.trim() ? '' : 'El nombre completo es requerido' }))
                  }}
                  placeholder="Ej: Juan García"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-900 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {fieldErrors.nombre && <p className="text-xs text-red-400 mt-1">{fieldErrors.nombre}</p>}
              </div>

              {/* Cédula */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cédula
                </label>
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => {
                    const soloNumeros = e.target.value.replace(/\D/g, '')
                    setFormData(prev => ({ ...prev, cedula: soloNumeros }))
                    setFieldErrors(prev => ({
                      ...prev,
                      cedula: soloNumeros
                        ? (!validarCedulaEcuatoriana(soloNumeros) ? 'Cédula ecuatoriana inválida' : '')
                        : 'La cédula es requerida'
                    }))
                  }}
                  placeholder="Ej: 1234567890"
                  className={`w-full px-3 py-2 border rounded-lg bg-gray-900 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.cedula ? 'border-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.cedula && <p className="text-xs text-red-400 mt-1">{fieldErrors.cedula}</p>}
              </div>

              {/* Tipo de Pasajero */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asiento Seleccionado
                </label>
                <div className={`w-full px-3 py-2 border-2 rounded-lg text-center font-bold ${
                  asientoSeleccionado
                    ? 'border-blue-500 bg-blue-950 text-blue-100'
                    : 'border-gray-300 bg-gray-800 text-gray-300'
                }`}>
                  {asientoSeleccionado || 'Selecciona un asiento'}
                </div>
                {fieldErrors.asiento && <p className="text-xs text-red-400 mt-1">{fieldErrors.asiento}</p>}
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <div className="p-3 border border-green-200 rounded-lg bg-green-900/90 flex items-center gap-2 text-green-100">
                  <DollarSign size={18} className="text-green-600" />
                  <span className="font-medium">Solo efectivo</span>
                </div>
              </div>

              {/* Botón Emitir */}
              <button
                onClick={handleEmitirBoleto}
                disabled={enviando || !formularioValido}
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
                  <h3 className="font-semibold text-white mb-3">Resumen</h3>
                  <div className="space-y-2 text-sm text-slate-200">
                    <div className="flex justify-between">
                      <span>Pasajero:</span>
                      <span className="font-medium text-white">{formData.nombre || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Asiento:</span>
                      <span className="font-medium text-white">{asientoSeleccionado}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="font-medium text-white">{formData.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pago:</span>
                      <span className="font-medium text-white">EFECTIVO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base:</span>
                      <span className="font-medium text-gray-900">${(ruta?.precio ?? 0).toFixed(2)}</span>
                    </div>
                    {asientoSeleccionado && esVIP(asientoSeleccionado) && (
                      <div className="flex justify-between">
                        <span>VIP +20%:</span>
                        <span className="font-medium text-amber-600">+${(((ruta?.precio ?? 0) * 0.2)).toFixed(2)}</span>
                      </div>
                    )}
                    {['MENOR', 'TERCERA_EDAD', 'DISCAPACITADO'].includes(formData.tipo) && (
                      <div className="flex justify-between">
                        <span>Descuento 50%:</span>
                        <span className="font-medium text-green-600">-${(((ruta?.precio ?? 0) * 0.5)).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span>Total:</span>
                      <span className="font-semibold text-green-300">${calcularPrecioFinal.toFixed(2)}</span>
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
