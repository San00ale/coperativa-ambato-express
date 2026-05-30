'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = session?.user?.role

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      if (role === 'ADMIN') router.push('/admin')
      else if (role === 'OFICINISTA') router.push('/oficinista')
      else if (role === 'CHOFER') router.push('/chofer')
      else if (role === 'CLIENTE') router.push('/cliente')
    }
  }, [status, router, role])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  if (!session) return null

  return <div className="min-h-screen flex items-center justify-center">Redirigiendo...</div>
}