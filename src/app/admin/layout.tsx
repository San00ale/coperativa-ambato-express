'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, LayoutDashboard, Clock, Map, Bus, Users } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false) // eslint-disable-line react-hooks/set-state-in-effect
  }, [pathname])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    )
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-2xl font-bold text-blue-600">
                Ambato Express
              </Link>
              <div className="hidden md:flex gap-4">
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/admin')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Estadísticas
                </Link>
                <Link
                  href="/admin/frecuencias"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/admin/frecuencias')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Clock size={18} />
                  Frecuencias
                </Link>
                <Link
                  href="/admin/rutas"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/admin/rutas')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Map size={18} />
                  Rutas
                </Link>
                <Link
                  href="/admin/buses"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/admin/buses')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Bus size={18} />
                  Buses
                </Link>
                <Link
                  href="/admin/usuarios"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/admin/usuarios')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Users size={18} />
                  Usuarios
                </Link>
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-gray-500 text-xs">Administrador</p>
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
              className="md:hidden text-gray-900 p-2 rounded-md hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <div className="border-t border-gray-200 pt-4 space-y-1">
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md w-full transition ${
                    isActive('/admin')
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Estadísticas
                </Link>
                <Link
                  href="/admin/frecuencias"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md w-full transition ${
                    isActive('/admin/frecuencias')
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Clock size={18} />
                  Frecuencias
                </Link>
                <Link
                  href="/admin/rutas"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md w-full transition ${
                    isActive('/admin/rutas')
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Map size={18} />
                  Rutas
                </Link>
                <Link
                  href="/admin/buses"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md w-full transition ${
                    isActive('/admin/buses')
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Bus size={18} />
                  Buses
                </Link>
                <Link
                  href="/admin/usuarios"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md w-full transition ${
                    isActive('/admin/usuarios')
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Users size={18} />
                  Usuarios
                </Link>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="px-3 py-2 mb-2">
                  <p className="font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-gray-500 text-xs">Administrador</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 w-full rounded-md transition"
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </div>
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