'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { AlertCircle, Loader, RefreshCw, Keyboard } from 'lucide-react'
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
  const { data: session } = useSession()
  const [rutaActual, setRutaActual] = useState<Ruta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estado del escáner
  const [escánerActivo, setEscánerActivo] = useState(true)
  const [boletoDetectado, setBoletoDetectado] = useState<Boleto | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [exito, setExito] = useState(false)
  
  // Ingreso manual
  const [mostrarManual, setMostrarManual] = useState(false)
  const [codigoManual, setCodigoManual] = useState('')
  const [validandoManual, setValidandoManual] = useState(false)
  
  // Referencias
  const containerRef = useRef<HTMLDivElement>(null)
  const escánerRef = useRef<Html5QrcodeScanner | null>(null)

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
        
        // Filtrar rutas activas
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

  // Inicializar escáner QR
  useEffect(() => {
    if (!containerRef.current || !escánerActivo || loading) return

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      disableFlip: false,
      showTorchButtonIfSupported: true,
      aspectRatio: 1.77778
    }

    let newScanner: Html5QrcodeScanner | null = null

    const initScanner = async () => {
      try {
        newScanner = new Html5QrcodeScanner('qr-reader', config, false)
        
        await newScanner.render(
          (decodedText) => handleQRDetected(decodedText),
          (error) => console.log('Escaneo:', error)
        )
        
        escánerRef.current = newScanner
      } catch (err) {
        console.error('Error iniciando escáner:', err)
        setError('Error al inicializar la cámara')
      }
    }

    initScanner()

    return () => {
      if (escánerRef.current) {
        escánerRef.current.clear().catch(err => 
          console.error('Error limpiando escáner:', err)
        )
        escánerRef.current = null
      }
    }
  }, [escánerActivo, loading])

  // Manejar detección de QR
const handleQRDetected = async (qrData: string) => {
  if (!escánerActivo) return
  setEscánerActivo(false)

  try {
    // 1. Parsear el QR — puede ser JSON o ID directo
    let boletoId: string
    try {
      const parsed = JSON.parse(qrData)
      boletoId = parsed.boletoId
    } catch {
      boletoId = qrData.trim() // Si es texto plano, usarlo directo
    }

    if (!boletoId) {
      setModalError('Código QR inválido. Intenta de nuevo.')
      setEscánerActivo(true)
      return
    }

    // 2. Llamar al GET de abordar para obtener los datos
    const response = await fetch(`/api/boletos/${boletoId}/abordar`)

    if (!response.ok) {
      const errorData = await response.json()
      setModalError(errorData.error || 'Boleto no encontrado')
      setEscánerActivo(true)
      return
    }

    const boleto = await response.json()
    // Mapear pasajero al campo que espera el modal
    setBoletoDetectado({
      ...boleto,
      pasajeroNombre: boleto.pasajero?.nombre,
      pasajeroCedula: boleto.pasajero?.cedula,
    })
    setModalError(null)
  } catch {
    setModalError('Error de red. Intenta nuevamente.')
    setEscánerActivo(true)
  }
}

  // Confirmar abordaje
const handleConfirmarAbordaje = async () => {
  if (!boletoDetectado || !rutaActual) return
  setConfirmando(true)
  setModalError(null)

  try {
    const response = await fetch(`/api/boletos/${boletoDetectado.id}/abordar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rutaId: rutaActual.id })
    })

    if (!response.ok) {
      const errorData = await response.json()
      // Mensajes personalizados por código
      const mensajes: Record<string, string> = {
        ALREADY_BOARDED: 'Este boleto ya fue utilizado. No se puede registrar nuevamente.',
        WRONG_ROUTE: `Este boleto corresponde a otra ruta. No puede abordar aquí.`,
        INVALID_STATE: `El boleto no está vigente (estado: ${boletoDetectado.estado}).`,
        WRONG_CHOFER: 'Este boleto no pertenece a tu ruta actual.',
        NOT_FOUND: 'Boleto no encontrado.',
      }
      setModalError(mensajes[errorData.code] || errorData.error || 'Error al registrar abordaje')
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

  // Validar código manual
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
        <p className="text-yellow-700 mt-2">Primero debes iniciar una ruta antes de poder escanear.</p>
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
          <strong>Ruta actual:</strong> {rutaActual.frecuencia.origen} → {rutaActual.frecuencia.destino} | Bus {rutaActual.bus.numero}
        </p>
      </div>

      {/* Error General */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Mensaje de Éxito */}
      {exito && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <div className="w-5 h-5 text-green-600 text-lg">✅</div>
          <p className="text-green-700 font-bold">Abordaje registrado correctamente</p>
        </div>
      )}

      {/* Escáner QR */}
      {escánerActivo && !boletoDetectado && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div 
            ref={containerRef}
            id="qr-reader"
            className="w-full bg-gray-900 rounded-lg overflow-hidden"
            style={{ minHeight: '400px' }}
          />
          
          <p className="text-center text-gray-600 text-sm">
            📱 Coloca el QR del boleto frente a la cámara
          </p>

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
              onKeyPress={(e) => e.key === 'Enter' && handleValidarManual()}
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
          error={modalError}
        />
      )}
    </div>
  )
}