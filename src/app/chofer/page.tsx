'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ChoferPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/chofer/mis-rutas')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full"></div>
        </div>
        <p className="mt-4 text-gray-600">Cargando tus rutas...</p>
      </div>
    </div>
  )
}