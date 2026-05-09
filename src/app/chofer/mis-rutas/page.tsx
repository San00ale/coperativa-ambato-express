'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Clock, MapPin, Bus, CheckCircle2, Circle, AlertCircle, Loader } from 'lucide-react'

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
  bus: {
    id: string
    numero: string
    placa: string
    marca: string
    carroceria: string
    chasis: string
    capacidad: number
    asientosVIP: number
  }
  boletos: Array<{
    id: string
  }>
}

export default function MisRutasPage() {
  const { data: session } = useSession()
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actualizando, setActualizando] = useState<string | null>(null)

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obtener la fecha actual en formato ISO
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const fechaFormato = today.toISOString().split('T')[0]

        // Llamar al API de rutas
        const response = await fetch(`/api/rutas?fecha=${fechaFormato}`)

        if (!response.ok) {
          throw new Error('Error al obtener las rutas')
        }

        const data = await response.json()
        setRutas(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Error fetching rutas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRutas()
  }, [])

  const handleMarcarCompletada = async (rutaId: string) => {
    try {
      setActualizando(rutaId)

      const response = await fetch(`/api/rutas/${rutaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completada: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar la ruta')
      }

      // Actualizar el estado local
      setRutas(rutas.map(ruta =>
        ruta.id === rutaId ? { ...ruta, completada: true } : ruta
      ))
    } catch (err) {
      alert('Error al marcar la ruta como completada: ' + (err instanceof Error ? err.message : 'Error desconocido'))
    } finally {
      setActualizando(null)
    }
  }

  const formatearHora = (hora: string) => {
    // Si viene en formato HH:MM, devolver como está
    if (hora.includes(':')) return hora
    // Si viene en otro formato, intentar parsear
    try {
      const date = new Date(hora)
      return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return hora
    }
  }

  const formatearFecha = (fecha: string) => {
    try {
      const date = new Date(fecha)
      return date.toLocaleDateString('es-EC', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return fecha
    }
  }


