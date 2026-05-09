'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { QrCode, CheckCircle2, AlertCircle, Loader, X, MapPin, Clock } from 'lucide-react'

interface Boleto {
  id: string
  estado: string
  asiento: string
  pasajero: {
    nombre: string
  }
}

interface RutaConBoletos {
  id: string
  completada: boolean
  frecuencia: {
    origen: string
    destino: string
    hora: string
  }
  bus: {
    numero: string
    placa: string
  }
  boletos: Boleto[]
}

export default function ValidarPasajerosPage() {
  const { data: session } = useSession()
  const [rutas, setRutas] = useState<RutaConBoletos[]>([])
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaConBoletos | null>(null)
  const [qrInput, setQrInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null)

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        setLoading(true)
        setError(null)

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const fechaFormato = today.toISOString().split('T')[0]

        const response = await fetch(`/api/rutas?fecha=${fechaFormato}`)

        if (!response.ok) {
          throw new Error('Error al obtener las rutas')
        }

        const data = await response.json()
        // Filtrar solo rutas no completadas
        setRutas(data.filter((r: RutaConBoletos) => !r.completada))
        
        if (data.length > 0) {
          setRutaSeleccionada(data[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchRutas()
  }, [])

  const handleValidarBoleto = (codigoQR: string) => {
    if (!rutaSeleccionada) {
      setMensaje({ tipo: 'error', texto: 'Selecciona una ruta primero' })
      return
    }

    // Simular búsqueda de boleto por QR
    const boletoEncontrado = rutaSeleccionada.boletos.find(
      b => b.id === codigoQR || b.qrUrl?.includes(codigoQR)
    )

    if (boletoEncontrado) {
      setMensaje({
        tipo: 'success',
        texto: `✓ Pasajero ${boletoEncontrado.pasajero.nombre} - Asiento ${boletoEncontrado.asiento}`
      })
      setQrInput('')
      setTimeout(() => setMensaje(null), 3000)
    } else {
      setMensaje({
        tipo: 'error',
        texto: 'Boleto no encontrado en esta ruta'
      })
      setQrInput('')
      setTimeout(() => setMensaje(null), 3000)
    }
  }

    if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600 mt-4">Cargando rutas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (rutas.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No hay rutas activas</h3>
        <p className="text-gray-600 mt-2">
          Todas tus rutas han sido completadas. Vuelve mañana.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <QrCode className="w-8 h-8 text-blue-600" />
          Validar Pasajeros
        </h1>
        <p className="text-gray-600 mt-2">
          Escanea los códigos QR de los boletos para registrar a los pasajeros
        </p>
      </div>

      {/* Seleccionar Ruta */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecciona tu ruta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rutas.map((ruta) => (
            <button
              key={ruta.id}
              onClick={() => setRutaSeleccionada(ruta)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                rutaSeleccionada?.id === ruta.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="font-semibold text-gray-900">
                {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  {ruta.frecuencia.hora}
                </div>
                <div>
                  Bus {ruta.bus.numero} - {ruta.bus.placa}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {ruta.boletos.length} boletos en esta ruta
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Scanner Area */}
      {rutaSeleccionada && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ruta: {rutaSeleccionada.frecuencia.origen} → {rutaSeleccionada.frecuencia.destino}
            </h2>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={18} />
                {rutaSeleccionada.frecuencia.hora}
              </div>
              <div className="flex items-center gap-2">
                Bus {rutaSeleccionada.bus.numero}
              </div>
              <div>
                {rutaSeleccionada.boletos.length} pasajeros confirmados
              </div>
            </div>
          </div>

          {/* QR Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Escanea el código QR del boleto
            </label>
            <div className="relative">
              <QrCode className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleValidarBoleto(qrInput)
                  }
                }}
                placeholder="Escanea aquí o ingresa el código..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              El código se procesará automáticamente al escanear
            </p>
          </div>

          {/* Messages */}
          {mensaje && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 animate-in ${
                mensaje.tipo === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {mensaje.tipo === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={mensaje.tipo === 'success' ? 'text-green-700' : 'text-red-700'}>
                {mensaje.texto}
              </p>
            </div>
          )}

          {/* Pasajeros List */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Pasajeros en esta ruta ({rutaSeleccionada.boletos.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {rutaSeleccionada.boletos.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay pasajeros confirmados</p>
              ) : (
                rutaSeleccionada.boletos.map((boleto) => (
                  <div
                    key={boleto.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                        {boleto.asiento.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{boleto.pasajero.nombre}</div>
                        <div className="text-xs text-gray-600">Asiento: {boleto.asiento}</div>
                      </div>
                    </div>
                    <div className="text-xs font-medium">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {boleto.estado}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
