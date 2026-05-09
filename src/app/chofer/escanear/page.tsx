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
