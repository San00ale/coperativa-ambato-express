'use client'

import { AlertCircle, CheckCircle2, Clock, MapPin, Users, XCircle } from 'lucide-react'

interface Boleto {
  id: string
  asiento: string
  estado: string
  pasajeroNombre?: string
  pasajeroCedula?: string
  ruta: {
    id: string
    frecuencia: {
      origen: string
      destino: string
      hora: string
    }
    bus: {
      numero: string
      capacidad: number
    }
  }
}

interface ModalConfirmarAbordajeProps {
  boleto: Boleto
  onConfirmar: () => Promise<void>
  onCancelar: () => void
  cargando?: boolean
  error?: string | null
}

export default function ModalConfirmarAbordaje({
  boleto,
  onConfirmar,
  onCancelar,
  cargando = false,
  error
}: ModalConfirmarAbordajeProps) {
  const esEstadoValido = boleto.estado === 'APROBADO'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <h2 className="text-lg font-bold">Datos del Pasajero</h2>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Información del Boleto */}
          <div className="space-y-3">
            {/* Nombre */}
            {boleto.pasajeroNombre && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-bold text-gray-900">{boleto.pasajeroNombre}</p>
                </div>
              </div>
            )}

            {/* Asiento */}
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold text-blue-600">🪑</span>
              <div>
                <p className="text-sm text-gray-600">Asiento</p>
                <p className="font-bold text-gray-900">{boleto.asiento}</p>
              </div>
            </div>

            {/* Ruta */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Ruta</p>
                <p className="font-bold text-gray-900">
                  {boleto.ruta.frecuencia.origen} → {boleto.ruta.frecuencia.destino}
                </p>
              </div>
            </div>

            {/* Hora */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Hora de Salida</p>
                <p className="font-bold text-gray-900">{boleto.ruta.frecuencia.hora}</p>
              </div>
            </div>

            {/* Estado */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Estado:</strong> {boleto.estado}
              </p>
              {!esEstadoValido && (
                <p className="text-sm text-red-700 mt-1">
                  ⚠️ Este boleto no está en estado APROBADO
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 font-bold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={cargando || !esEstadoValido}
            className={`flex-1 px-4 py-2 font-bold rounded-lg transition ${
              esEstadoValido
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            {cargando ? 'Procesando...' : 'Confirmar Abordaje'}
          </button>
        </div>
      </div>
    </div>
  )
}