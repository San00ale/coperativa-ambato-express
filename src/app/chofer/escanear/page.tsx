'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { QrCode, CheckCircle2, AlertCircle, Loader, Camera, X, RotateCcw } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

interface PasajeroInfo {
  nombre: string
  cedula: string
  asiento: string
  tipo: string
  metodoPago: string
}

export default function EscanearPage() {
  const { data: session } = useSession()
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending')
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pasajeroActual, setPasajeroActual] = useState<PasajeroInfo | null>(null)
  const [validando, setValidando] = useState(false)
  const QR_REGION_ID = 'html5qr-code-full-region'
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null)
  const startingRef = useRef(false)

  const onScanFailure = useCallback((errorMessage: string) => {
    if (!errorMessage.includes('No QR code found')) {
      console.debug('QR Scan error:', errorMessage)
    }
  }, [])

  const onScanSuccess = useCallback(
    async (decodedText: string) => {
      try {
        setLoading(true)
        setError(null)

        if (scanning && html5QrcodeRef.current) {
          await html5QrcodeRef.current.stop()
          setScanning(false)
        }

        const response = await fetch('/api/boletos/validar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qrData: decodedText.trim(),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al procesar el boleto')
        }

        const result = await response.json()

        if (!result.boleto && !result.pasajero) {
          throw new Error(result.error || result.message || 'Error al procesar el boleto')
        }

        const boletoData = result.boleto || {
          asiento: result.asiento,
          pasajero: {
            nombre: result.pasajero,
            cedula: result.cedula,
          },
          tipoPasajero: result.tipo || 'ADULTO',
          metodoPago: result.pago || 'EFECTIVO',
        }

        setPasajeroActual({
          nombre: boletoData.pasajero.nombre || result.pasajero,
          cedula: boletoData.pasajero.cedula || result.cedula,
          asiento: boletoData.asiento,
          tipo: boletoData.tipoPasajero || 'ADULTO',
          metodoPago: boletoData.metodoPago || 'EFECTIVO',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar el QR')
        setPasajeroActual(null)
      } finally {
        setLoading(false)
      }
    },
    [scanning]
  )

  const startScanner = useCallback(
    async () => {
      if (startingRef.current || scanning) return

      startingRef.current = true

      try {
        const qr = new Html5Qrcode(QR_REGION_ID)
        html5QrcodeRef.current = qr
        setScanner(qr)

        await qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          onScanFailure
        )

        setScanning(true)
      } catch (err) {
        setError('Error al inicializar la cámara')
        console.error('Error initializing scanner:', err)
      } finally {
        startingRef.current = false
      }
    },
    [onScanSuccess, onScanFailure, scanning]
  )

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach((track) => track.stop())
        setCameraPermission('granted')
      } catch {
        setCameraPermission('denied')
        setError('Permiso de cámara denegado. No se puede usar el escaneo.')
      }
    }

    requestCameraPermission()
  }, [])

  useEffect(() => {
    if (cameraPermission !== 'granted') return

    startScanner()

    return () => {
      if (html5QrcodeRef.current && scanning) {
        html5QrcodeRef.current.stop().catch(console.error)
      }
    }
  }, [cameraPermission, scanning, startScanner])

  const handleConfirmarValidacion = useCallback(
    async () => {
      if (!pasajeroActual) return

      try {
        setValidando(true)
        setError(null)
        setSuccessMessage(`✓ ${pasajeroActual.nombre} ha abordado correctamente`)

        setTimeout(async () => {
          setPasajeroActual(null)
          setSuccessMessage(null)
          await startScanner()
        }, 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al confirmar')
      } finally {
        setValidando(false)
      }
    },
    [pasajeroActual, startScanner]
  )

  const handleReiniciar = async () => {
    setPasajeroActual(null)
    setError(null)
    setSuccessMessage(null)

    if (scanner && !scanning) {
      try {
        await scanner.resume()
        setScanning(true)
      } catch (err) {
        console.error('Error resuming scanner:', err)
        setError('Error al reiniciar la cámara')
      }
    }
  }

  if (cameraPermission === 'pending') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600 mt-4">Solicitando acceso a cámara...</p>
        </div>
      </div>
    )
  }

  if (cameraPermission === 'denied') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="font-semibold text-red-900 text-lg">Permiso de Cámara Denegado</h3>
        <p className="text-red-700 mt-2">
          Necesitas permitir acceso a la cámara para escanear códigos QR.
        </p>
        <p className="text-red-600 text-sm mt-4">
          Por favor, habilita los permisos de cámara en tu navegador y recarga la página.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <QrCode className="w-8 h-8 text-blue-600" />
          Escanear Abordaje de Pasajeros
        </h1>
        <p className="text-gray-600 mt-2">
          Escanea el código QR del boleto para validar el abordaje del pasajero
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900">
            <X size={20} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-in">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Validación Completada</h3>
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-black aspect-video relative">
              {scanning && cameraPermission === 'granted' ? (
                <div id={QR_REGION_ID} className="w-full h-full" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                  <Camera className="w-12 h-12 text-gray-600" />
                  <p className="text-gray-400 text-center">
                    {loading ? 'Procesando QR...' : 'Inicializando cámara...'}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border-t border-blue-200 p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Instrucciones:</strong> Apunta el código QR del boleto hacia la cámara.
                La lectura se realizará automáticamente.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
            {pasajeroActual ? (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Pasajero Detectado</h2>

                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 space-y-3">
                  <div>
                    <div className="text-xs text-blue-700 font-semibold">NOMBRE</div>
                    <p className="text-lg font-bold text-blue-900">{pasajeroActual.nombre}</p>
                  </div>

                  <div className="border-t border-blue-200 pt-3">
                    <div className="text-xs text-blue-700 font-semibold">CÉDULA</div>
                    <p className="text-sm font-mono text-blue-900">{pasajeroActual.cedula}</p>
                  </div>

                  <div className="border-t border-blue-200 pt-3">
                    <div className="text-xs text-blue-700 font-semibold">ASIENTO</div>
                    <p className="text-xl font-bold text-blue-900">{pasajeroActual.asiento}</p>
                  </div>

                  <div className="border-t border-blue-200 pt-3">
                    <div className="text-xs text-blue-700 font-semibold">TIPO DE PASAJERO</div>
                    <p className="text-sm text-blue-900 capitalize">{pasajeroActual.tipo}</p>
                  </div>

                  <div className="border-t border-blue-200 pt-3">
                    <div className="text-xs text-blue-700 font-semibold">MÉTODO DE PAGO</div>
                    <p className="text-sm text-blue-900 capitalize">{pasajeroActual.metodoPago}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleConfirmarValidacion}
                    disabled={validando}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {validando ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Validando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        Confirmar Abordaje
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleReiniciar}
                    disabled={validando}
                    className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} />
                    Cancelar
                  </button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">✓ Boleto válido y aprobado</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-8">
                <QrCode className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600 font-medium">Esperando lectura de QR</p>
                  <p className="text-gray-500 text-sm">Apunta el código QR del boleto a la cámara</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="font-semibold text-gray-900 mb-4">ℹ️ Información</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">📱 Escaneo</h3>
            <p className="text-sm text-gray-600">Coloca el código QR del boleto frente a la cámara. El dispositivo detectará automáticamente el código.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">✓ Validación</h3>
            <p className="text-sm text-gray-600">Verifica que el nombre y asiento del pasajero sean correctos antes de confirmar el abordaje.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">💾 Registro</h3>
            <p className="text-sm text-gray-600">Al confirmar, se registra el abordaje en el sistema con fecha y hora exacta.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

