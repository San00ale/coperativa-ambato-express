'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { QrCode, CheckCircle2, AlertCircle, Loader, Camera, X, RotateCcw } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'

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
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pasajeroActual, setPasajeroActual] = useState<PasajeroInfo | null>(null)
  const [validando, setValidando] = useState(false)
  const qrcodeRegionId = 'html5qr-code-full-region'

  // Solicitar permiso de cámara al cargar
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        setCameraPermission('granted')
      } catch (err) {
        setCameraPermission('denied')
        setError('Permiso de cámara denegado. No se puede usar el escaneo.')
      }
    }

    requestCameraPermission()
  }, [])

  // Inicializar scanner cuando se otorga permiso
  useEffect(() => {
    if (cameraPermission !== 'granted' || scanner) return

    let newScanner: Html5QrcodeScanner | null = null

    try {
      newScanner = new Html5QrcodeScanner(
        qrcodeRegionId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
        },
        false
      )

      newScanner.render(onScanSuccess, onScanFailure)
      setScanner(newScanner)
      setScanning(true)
    } catch (err) {
      setError('Error al inicializar la cámara')
      console.error('Error initializing scanner:', err)
    }

    return () => {
      if (newScanner) {
        newScanner.clear().catch((err: unknown) => console.error('Error clearing scanner:', err))
      }
    }
  }, [cameraPermission])

  
  const onScanSuccess = async (decodedText: string) => {
    try {
      setLoading(true)
      setError(null)

      // El QR contiene JSON con los datos del boleto
      // Enviar como está (qrData es el contenido del QR)
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

      // Adaptar respuesta del API
      const boletoData = result.boleto || {
        asiento: result.asiento,
        pasajero: {
          nombre: result.pasajero,
          cedula: result.cedula
        },
        tipoPasajero: result.tipo || 'ADULTO',
        metodoPago: result.pago || 'EFECTIVO'
      }

      // Mostrar información del pasajero
      setPasajeroActual({
        nombre: boletoData.pasajero.nombre || result.pasajero,
        cedula: boletoData.pasajero.cedula || result.cedula,
        asiento: boletoData.asiento,
        tipo: boletoData.tipoPasajero || 'ADULTO',
        metodoPago: boletoData.metodoPago || 'EFECTIVO',
      })

      // Pausar scanner mientras se muestra resultado
      if (scanner) {
        await scanner.pause()
        setScanning(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el QR')
      setPasajeroActual(null)
    } finally {
      setLoading(false)
    }
  }

  const onScanFailure = (error: string) => {
    // Ignorar errores de detección que no son críticos
    if (!error.includes('No QR code found')) {
      console.debug('QR Scan error:', error)
    }
  }

  const handleConfirmarValidacion = async () => {
    if (!pasajeroActual) return

    try {
      setValidando(true)
      setError(null)

      // En la respuesta anterior ya se validó, aquí solo confirmamos
      setSuccessMessage(`✓ ${pasajeroActual.nombre} ha abordado correctamente`)

      // Limpiar después de 3 segundos y reiniciar scanner
      setTimeout(() => {
        setPasajeroActual(null)
        setSuccessMessage(null)
        if (scanner && !scanning) {
          scanner.resume()
          setScanning(true)
        }
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al confirmar')
    } finally {
      setValidando(false)
    }
  }

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

