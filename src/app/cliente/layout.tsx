'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, Search, ShoppingBag } from 'lucide-react'

export default function ClienteLayout({
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
      return
    }
    if (status === 'authenticated' && session?.user?.role !== 'CLIENTE') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    )
  } if (status === 'unauthenticated') {
    return null
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            <div className="flex items-center gap-8">
              <Link href="/cliente" className="text-2xl font-bold text-blue-600">
                Ambato Express
              </Link>
              <div className="hidden md:flex gap-4">
                <Link
                  href="/cliente/buscar"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                >
                  <Search size={18} />
                  Buscar Rutas
                </Link>
                <Link
                  href="/cliente/mis-compras"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                >
                  <ShoppingBag size={18} />
                  Mis Compras
                </Link>
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-gray-600 text-xs">Cliente</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition"
              >
                <LogOut size={18} />
                Cerrar sesión
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
                href="/cliente/buscar"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 w-full"
              >
                <Search size={18} />
                Buscar Rutas
              </Link>
              <Link
                href="/cliente/mis-compras"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 w-full"
              >
                <ShoppingBag size={18} />
                Mis Compras
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 w-full rounded-md"
              >
                <LogOut size={18} />
                Cerrar sesión
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