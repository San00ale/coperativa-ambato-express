'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/components/AdminHeader'
import SeatSelector from '@/components/SeatSelector'

interface Bus {
  id: string
  numero: string
  placa: string
  chasis: string
  carroceria: string
  marca: string
  capacidad: number
  asientosVIP: number
  asientosVIPNumeros?: string
  fotoUrl?: string | null
  activo: boolean
}

export default function EditarBusPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [bus, setBus] = useState<Bus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    numero: '',
    placa: '',
    chasis: '',
    carroceria: '',
    marca: '',
    capacidad: '',
    asientosVIP: '',
    asientosVIPNumeros: '',
    fotoUrl: ''
  })
  const [selectedVIPSeats, setSelectedVIPSeats] = useState<number[]>([])

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    const cargarBus = async () => {
      try {
        const response = await fetch(`/api/buses/${id}`)
        if (response.ok) {
          const data = await response.json()
          setBus(data)
          const vipSeatsArray = data.asientosVIPNumeros 
            ? data.asientosVIPNumeros.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n))
            : []
          setSelectedVIPSeats(vipSeatsArray)
          setFormData({
            numero: data.numero,
            placa: data.placa,
            chasis: data.chasis,
            carroceria: data.carroceria,
            marca: data.marca,
            capacidad: data.capacidad.toString(),
            asientosVIP: data.asientosVIP.toString(),
            asientosVIPNumeros: data.asientosVIPNumeros || '',
            fotoUrl: data.fotoUrl || ''
          })
        } else {
          setError('Error al cargar el bus')
        }
      } catch (error) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    void cargarBus()
  }, [session, router, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/buses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacidad: parseInt(formData.capacidad),
          asientosVIP: selectedVIPSeats.length,
          asientosVIPNumeros: selectedVIPSeats.sort((a, b) => a - b).join(','),
        }),
      })
      if (response.ok) {
        setSuccess('Bus actualizado correctamente')
        setTimeout(() => {
          router.push('/admin/buses')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al procesar la solicitud')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  if (loading) {
    return (
      <div>
        <AdminHeader title="Editar Bus" />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!bus) {
    return (
      <div>
        <AdminHeader title="Editar Bus" />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-red-500">Bus no encontrado</p>
          <Link href="/admin/buses" className="text-blue-600 hover:underline">
            Volver a la lista de buses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminHeader title="Editar Bus" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin/buses" className="text-blue-600 hover:underline">
            ← Volver a la lista de buses
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Editar Bus {bus.numero}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input 
                type="text" 
                required 
                value={formData.numero} 
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
              <input 
                type="text" 
                required 
                value={formData.placa} 
                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chasis</label>
              <input 
                type="text" 
                value={formData.chasis} 
                onChange={(e) => setFormData({ ...formData, chasis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carrocería</label>
              <input 
                type="text" 
                value={formData.carroceria} 
                onChange={(e) => setFormData({ ...formData, carroceria: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input 
                type="text" 
                value={formData.marca} 
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad *</label>
              <input 
                type="number" 
                required 
                min="1" 
                value={formData.capacidad} 
                onChange={(e) => {
                  setFormData({ ...formData, capacidad: e.target.value })
                  setSelectedVIPSeats([])
                }} 
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Foto</label>
              <input 
                type="text" 
                value={formData.fotoUrl} 
                onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>
          </div>

          {formData.capacidad && parseInt(formData.capacidad) > 0 && (
            <SeatSelector
              capacidad={parseInt(formData.capacidad)}
              selectedVIPSeats={selectedVIPSeats}
              onSeatToggle={(seatNumber) => {
                setSelectedVIPSeats(prev => 
                  prev.includes(seatNumber) 
                    ? prev.filter(s => s !== seatNumber)
                    : [...prev, seatNumber]
                )
              }}
            />
          )}

          <div className="mt-6 flex justify-end gap-4">
            <Link
              href="/admin/buses"
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
