'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  if (!session) return null

  const role = session.user?.role

  useEffect(() => {
    if (role === 'ADMIN') router.push('/admin')
    else if (role === 'OFICINISTA') router.push('/oficinista')
    else if (role === 'CHOFER') router.push('/chofer')
    else if (role === 'CLIENTE') router.push('/cliente')
  }, [role, router])

  return <div className="min-h-screen flex items-center justify-center">Redirigiendo...</div>
}