'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { AlertCircle, Loader, Keyboard } from 'lucide-react'
import ModalConfirmarAbordaje from '@/components/ModalConfirmarAbordaje'

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

interface Ruta {
  id: string
  estado: string
  frecuencia: {
    origen: string
    destino: string
  }
  bus: {
    numero: string
  }
}

export default function EscanearPage() {
  const [rutaActual, setRutaActual] = useState<Ruta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estado del escáner
  const [escánerActivo, setEscánerActivo] = useState(true)
  const [boletoDetectado, setBoletoDetectado] = useState<Boleto | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [errorEscaner, setErrorEscaner] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [exito, setExito] = useState(false)

  // Ingreso manual
  const [mostrarManual, setMostrarManual] = useState(false)
  const [codigoManual, setCodigoManual] = useState('')
  const [validandoManual, setValidandoManual] = useState(false)

  // Referencias
  const escánerRef = useRef<Html5Qrcode | null>(null)
  const rutaActualRef = useRef<Ruta | null>(null)

  // Mantener ref sincronizada para usarla dentro de callbacks
  useEffect(() => {
    rutaActualRef.current = rutaActual
  }, [rutaActual])

  // Obtener ruta actual del chofer
  useEffect(() => {
    const fetchRuta = async () => {
      try {
        setLoading(true)
        const today = new Date().toLocaleDateString('en-CA')
        const response = await fetch(`/api/rutas?fecha=${today}`)

        if (!response.ok) {
          throw new Error('Error al obtener la ruta')
        }

        const rutas = await response.json()

        const rutaActiva = rutas.find((r: Ruta) =>
          ['pendiente', 'en_curso'].includes(r.estado)
        )

        setRutaActual(rutaActiva || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchRuta()
  }, [])

  // Manejar detección de QR — declarada ANTES del useEffect que la usa
  const handleQRDetected = useCallback(async (qrData: string) => {
    setEscánerActivo(false)
    setErrorEscaner(null)

    try {
      // Parsear el QR — puede ser JSON {"boletoId": "..."} o ID directo
      let boletoId: string
      try {
        const parsed = JSON.parse(qrData)
        boletoId = parsed.boletoId
      } catch {
        boletoId = qrData.trim()
      }

      if (!boletoId) {
        setErrorEscaner('Código QR inválido. Intenta de nuevo.')
        setEscánerActivo(true)
        return
      }

      const response = await fetch(`/api/boletos/${boletoId}/abordar`)

      if (!response.ok) {
        const errorData = await response.json()
        setErrorEscaner(errorData.error || 'Boleto no encontrado.')
        setEscánerActivo(true)
        return
      }

      const boleto = await response.json()

      setBoletoDetectado({
        ...boleto,
        pasajeroNombre: boleto.pasajero?.nombre,
        pasajeroCedula: boleto.pasajero?.cedula,
      })
      setModalError(null)
    } catch {
      setErrorEscaner('Error de red. Intenta nuevamente.')
      setEscánerActivo(true)
    }
  }, [])

  // Inicializar / destruir escáner QR
  useEffect(() => {
    if (loading) return

    if (!escánerActivo) {
      if (escánerRef.current) {
        escánerRef.current
          .stop()
          .then(() => escánerRef.current?.clear())
          .catch(() => {})
        escánerRef.current = null
      }
      return
    }

    const timer = setTimeout(() => {
      const scanner = new Html5Qrcode('qr-reader')
      escánerRef.current = scanner

      scanner
        .start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 300, height: 300 },
            aspectRatio: 1.0,
          },
          (decodedText) => handleQRDetected(decodedText),
          () => {}
        )
        .catch(() => {
          setError('No se pudo acceder a la cámara. Verifica los permisos del navegador.')
        })
    }, 100)

    return () => {
      clearTimeout(timer)
      if (escánerRef.current) {
        escánerRef.current
          .stop()
          .then(() => escánerRef.current?.clear())
          .catch(() => {})
        escánerRef.current = null
      }
    }
  }, [escánerActivo, loading, handleQRDetected])

  // Confirmar abordaje
  const handleConfirmarAbordaje = async () => {
    if (!boletoDetectado || !rutaActual) return

    setConfirmando(true)
    setModalError(null)

    try {
      const response = await fetch(`/api/boletos/${boletoDetectado.id}/abordar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rutaId: rutaActual.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        const mensajes: Record<string, string> = {
          ALREADY_BOARDED:
            'Este boleto ya fue utilizado para abordar el bus. No se puede registrar nuevamente.',
          WRONG_ROUTE:
            'Este boleto corresponde a otra ruta (origen/destino diferente). No puede abordar aquí.',
          INVALID_STATE: `El boleto no está vigente (estado: ${boletoDetectado.estado}).`,
          WRONG_STATE: `El boleto no está en estado APROBADO (estado actual: ${boletoDetectado.estado}).`,
          WRONG_CHOFER: 'Este boleto no pertenece a tu ruta actual.',
          NOT_FOUND: 'Boleto no encontrado.',
          SERVER_ERROR: 'Error en el servidor. Intenta nuevamente.',
        }

        setModalError(
          mensajes[errorData.code] || errorData.error || 'Error al registrar abordaje.'
        )
        return
      }

      setExito(true)
      setBoletoDetectado(null)

      setTimeout(() => {
        setExito(false)
        setEscánerActivo(true)
      }, 2500)
    } catch {
      setModalError('Error de conexión. Intenta nuevamente.')
    } finally {
      setConfirmando(false)
    }
  }

  // Validar código ingresado manualmente
  const handleValidarManual = async () => {
    if (!codigoManual.trim()) return

    try {
      setValidandoManual(true)
      await handleQRDetected(codigoManual.trim())
      setCodigoManual('')
      setMostrarManual(false)
    } finally {
      setValidandoManual(false)
    }
  }

  // Renders condicionales

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!rutaActual) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="font-semibold text-yellow-900 text-lg">No hay ruta activa</h3>
        <p className="text-yellow-700 mt-2">
          Primero debes iniciar una ruta antes de poder escanear.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Escanear Abordaje</h1>
        <p className="text-gray-600 mt-2">
          Escanea el QR de cada pasajero para registrar su abordaje
        </p>
      </div>

      {/* Ruta Actual */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Ruta actual:</strong>{' '}
          {rutaActual.frecuencia.origen} → {rutaActual.frecuencia.destino} | Bus{' '}
          {rutaActual.bus.numero}
        </p>
      </div>

      {/* Error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Mensaje de éxito */}
      {exito && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-lg">✅</span>
          <p className="text-green-700 font-bold">Abordaje registrado correctamente</p>
        </div>
      )}

      {/* Escáner QR */}
      {escánerActivo && !boletoDetectado && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex justify-center">
            <div
              id="qr-reader"
              className="rounded-lg overflow-hidden"
              style={{ width: '320px', height: '320px' }}
            />
          </div>

          <p className="text-center text-gray-600 text-sm">
            📱 Coloca el QR del boleto frente a la cámara
          </p>

          {errorEscaner && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-red-700 text-sm">{errorEscaner}</p>
            </div>
          )}

          <button
            onClick={() => setMostrarManual(!mostrarManual)}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <Keyboard size={18} />
            Ingresar Código Manualmente
          </button>
        </div>
      )}

      {/* Ingreso Manual */}
      {mostrarManual && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Ingresar código QR manualmente</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              placeholder="Pega el código QR aquí"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleValidarManual()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleValidarManual}
                disabled={validandoManual || !codigoManual.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"
              >
                {validandoManual ? 'Validando...' : 'Validar'}
              </button>
              <button
                onClick={() => {
                  setMostrarManual(false)
                  setCodigoManual('')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {boletoDetectado && (
        <ModalConfirmarAbordaje
          boleto={boletoDetectado}
          onConfirmar={handleConfirmarAbordaje}
          onCancelar={() => {
            setBoletoDetectado(null)
            setModalError(null)
            setEscánerActivo(true)
          }}
          cargando={confirmando}
          error={modalError ?? undefined}
        />
      )}
    </div>
  )
}