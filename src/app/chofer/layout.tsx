'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, MapPin, QrCode, Ticket } from 'lucide-react'

export default function ChoferLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user?.role !== 'CHOFER') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/chofer" className="text-2xl font-bold text-blue-600">
                Ambato Express
              </Link>
              <div className="hidden md:flex gap-4">
                <Link
                  href="/chofer/mis-rutas"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                >
                  <MapPin size={18} />
                  Mis Rutas
                </Link>
                <Link
                  href="/chofer/vender-en-ruta"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                >
                  <Ticket size={18} />
                  Vender Boletos
                </Link>
                <Link
                  href="/chofer/escanear"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                >
                  <QrCode size={18} />
                  Escanear
                </Link>
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-gray-600 text-xs">Chofer</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition"
              >
                <LogOut size={18} />
                Salir
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link
                href="/chofer/mis-rutas"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 w-full"
              >
                <MapPin size={18} />
                Mis Rutas
              </Link>
              <Link
                href="/chofer/vender-en-ruta"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 w-full"
              >
                <Ticket size={18} />
                Vender Boletos
              </Link>
              <Link
                href="/chofer/escanear"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 w-full"
              >
                <QrCode size={18} />
                Escanear Abordaje
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 w-full rounded-md"
              >
                <LogOut size={18} />
                Salir
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}