'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AdminPage() { 
  const router = useRouter()
  const { data: session } = useSession()
  
  const handleNavigateToBuses = () => {
    if (!session) {
      router.push('/login')
      return
    }
    router.push('/admin/buses')
  }
  
  return ( 
    <div className="p-8"> 
      <h1 className="text-2xl font-bold mb-6">Panel de Administrador</h1> 
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Gestión del Sistema</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-medium text-gray-900">Transporte</h3>
            <p className="text-gray-600 text-sm mt-1">Gestión de buses y rutas</p>
            <button
              onClick={handleNavigateToBuses}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
            >
              Gestionar Buses
            </button>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium text-gray-900">Ventas</h3>
            <p className="text-gray-600 text-sm mt-1">Reportes y estadísticas</p>
            <button
              className="mt-3 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm"
              disabled
            >
              Próximamente
            </button>
          </div>
        </div>
      </div>
    </div> 
  )
}