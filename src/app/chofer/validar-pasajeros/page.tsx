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
