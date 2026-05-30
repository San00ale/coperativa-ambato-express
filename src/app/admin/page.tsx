'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import AdminHeader from '@/components/AdminHeader'

interface Boleto {
  id: string
  precio: number
  estado: string
  createdAt: string
  ruta: {
    frecuencia: {
      origen: string
      destino: string
    }
  }
}

export default function AdminPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [boletosHoy, setBoletosHoy] = useState<number>(0)
  const [ingresosHoy, setIngresosHoy] = useState<number>(0)
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    cargarEstadisticas()
  }, [session, router])

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('/api/boletos')
      if (response.ok) {
        const data: Boleto[] = await response.json()
        
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        
        const boletosFiltrados = data.filter(boleto => {
          const fechaBoleto = new Date(boleto.createdAt)
          fechaBoleto.setHours(0, 0, 0, 0)
          return (
            fechaBoleto.getTime() === hoy.getTime() &&
            (boleto.estado === 'APROBADO' || boleto.estado === 'ABORDADO')
          )
        })
        
        setBoletosHoy(boletosFiltrados.length)
        setIngresosHoy(boletosFiltrados.reduce((total, boleto) => total + boleto.precio, 0))
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setLoadingEstadisticas(false)
    }
  }

  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <AdminHeader title="Panel de Administrador" showBackButton={false} />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/admin/buses"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Buses</h3>
              <p className="text-sm text-gray-600">Administrar flota de buses</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/admin/frecuencias"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Frecuencias</h3>
              <p className="text-sm text-gray-600">Administrar horarios y rutas</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/admin/rutas"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Rutas</h3>
              <p className="text-sm text-gray-600">Asignar buses a frecuencias</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/admin/usuarios"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
              <p className="text-sm text-gray-600">Administrar choferes y oficinistas</p>
            </div>
          </div>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Gestión del Sistema</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium text-gray-900">Ventas</h3>
            <p className="text-gray-600 text-sm mt-1">Reportes y estadísticas</p>
            <div className="mt-3 space-y-2">
              {loadingEstadisticas ? (
                <p className="text-gray-500 text-sm">Cargando estadísticas...</p>
              ) : (
                <>
                  <p className="text-gray-900 font-semibold">
                    Boletos vendidos hoy: {boletosHoy}
                  </p>
                  <p className="text-gray-900 font-semibold">
                    Ingresos totales hoy: ${ingresosHoy.toFixed(2)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}