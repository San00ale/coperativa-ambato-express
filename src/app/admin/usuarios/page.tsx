'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TableSkeleton, CardSkeleton } from '@/components/Skeleton'
import Pagination from '@/components/Pagination'

interface Usuario {
  id: string
  nombre: string
  email: string
  cedula: string
  rol: string
  activo: boolean
}

export default function UsuariosPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [clientes, setClientes] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal agregar usuario
  const [showAgregarModal, setShowAgregarModal] = useState(false)
  const [modalError, setModalError] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cedula: '',
    password: '',
    rol: 'CHOFER' as 'CHOFER' | 'OFICINISTA'
  })
  const [submitting, setSubmitting] = useState(false)

  // Modal agregar cliente
  const [showAgregarClienteModal, setShowAgregarClienteModal] = useState(false)
  const [modalClienteError, setModalClienteError] = useState('')
  const [clienteFormData, setClienteFormData] = useState({
    nombre: '',
    email: '',
    cedula: '',
    password: ''
  })
  const [submittingCliente, setSubmittingCliente] = useState(false)

  // Pagination
  const [currentPageUsuarios, setCurrentPageUsuarios] = useState(1)
  const [currentPageClientes, setCurrentPageClientes] = useState(1)
  const itemsPerPage = 10

  // ---------- Funciones de carga (optimizadas con useCallback) ----------
  const cargarUsuarios = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/usuarios')
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al cargar los usuarios')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  const cargarClientes = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/clientes')
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al cargar los clientes')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoadingClientes(false)
    }
  }, [])

  // ---------- Efecto principal: redirigir si no es admin y cargar datos ----------
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    const cargarTodo = async () => {
      await Promise.all([cargarUsuarios(), cargarClientes()])
    }
    cargarTodo()
  }, [session, router, cargarUsuarios, cargarClientes])

  // ---------- Handlers para usuarios ----------
  const handleAgregar = () => {
    setModalError('')
    setShowAgregarModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setModalError('')

    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess('Usuario creado exitosamente')
        setShowAgregarModal(false)
        setFormData({
          nombre: '',
          email: '',
          cedula: '',
          password: '',
          rol: 'CHOFER'
        })
        await cargarUsuarios()
      } else {
        const errorData = await response.json()
        setModalError(errorData.error || 'Error al crear usuario')
      }
    } catch (error) {
      setModalError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCambiarEstado = async (usuario: Usuario) => {
    if (!confirm(`¿Estás seguro de ${usuario.activo ? 'suspender' : 'activar'} a ${usuario.nombre}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/usuarios/${usuario.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !usuario.activo })
      })

      if (response.ok) {
        setSuccess(`Usuario ${usuario.activo ? 'suspendido' : 'activado'} exitosamente`)
        await cargarUsuarios()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al cambiar estado')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  // ---------- Handlers para clientes ----------
  const handleAgregarCliente = () => {
    setModalClienteError('')
    setShowAgregarClienteModal(true)
  }

  const handleSubmitCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingCliente(true)
    setModalClienteError('')

    try {
      const response = await fetch('/api/admin/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteFormData)
      })

      if (response.ok) {
        setSuccess('Cliente creado exitosamente')
        setShowAgregarClienteModal(false)
        setClienteFormData({
          nombre: '',
          email: '',
          cedula: '',
          password: ''
        })
        await cargarClientes()
      } else {
        const errorData = await response.json()
        setModalClienteError(errorData.error || 'Error al crear cliente')
      }
    } catch (error) {
      setModalClienteError('Error de conexión')
    } finally {
      setSubmittingCliente(false)
    }
  }

  const handleCambiarEstadoCliente = async (cliente: Usuario) => {
    if (!confirm(`¿Estás seguro de ${cliente.activo ? 'suspender' : 'activar'} a ${cliente.nombre}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/clientes/${cliente.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !cliente.activo })
      })

      if (response.ok) {
        setSuccess(`Cliente ${cliente.activo ? 'suspendido' : 'activado'} exitosamente`)
        await cargarClientes()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al cambiar estado')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  // ---------- Renderizado condicional de carga ----------
  if (loading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={5} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  // Calculate pagination
  const totalPagesUsuarios = Math.ceil(usuarios.length / itemsPerPage)
  const startIndexUsuarios = (currentPageUsuarios - 1) * itemsPerPage
  const endIndexUsuarios = startIndexUsuarios + itemsPerPage
  const paginatedUsuarios = usuarios.slice(startIndexUsuarios, endIndexUsuarios)

  const totalPagesClientes = Math.ceil(clientes.length / itemsPerPage)
  const startIndexClientes = (currentPageClientes - 1) * itemsPerPage
  const endIndexClientes = startIndexClientes + itemsPerPage
  const paginatedClientes = clientes.slice(startIndexClientes, endIndexClientes)

  // ---------- JSX principal ----------
  return (
    <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <button
            onClick={handleAgregar}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
          >
            <span className="text-xl">+</span>
            Agregar Usuario
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span>{success}</span>
          </div>
        )}

      {/* Tabla de Usuarios (Choferes y Oficinistas) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Usuarios (Choferes y Oficinistas)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cédula</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsuarios.map((usuario) => (
                <tr key={usuario.id} className={!usuario.activo ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50 transition'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {usuario.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {usuario.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {usuario.cedula}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                      usuario.rol === 'CHOFER' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {usuario.rol === 'CHOFER' ? '🚗 Chofer' : '📋 Oficinista'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                      usuario.activo 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {usuario.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleCambiarEstado(usuario)}
                      className={`inline-flex items-center gap-1 font-semibold ${
                        usuario.activo 
                          ? 'text-red-600 hover:text-red-800' 
                          : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {usuario.activo ? '🗑️ Suspender' : '✅ Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usuarios.length === 0 && (
            <div className="text-center py-12">
              <span className="text-5xl mb-3 block">👥</span>
              <p className="text-gray-500 text-lg">No hay usuarios registrados</p>
              <p className="text-gray-400 text-sm mt-1">Agrega un nuevo usuario para comenzar</p>
            </div>
          )}
        </div>

        {usuarios.length > 0 && (
          <Pagination
            currentPage={currentPageUsuarios}
            totalPages={totalPagesUsuarios}
            onPageChange={setCurrentPageUsuarios}
            itemsPerPage={itemsPerPage}
            totalItems={usuarios.length}
          />
        )}
      </div>

      {/* Sección de Clientes */}
      <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden mt-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            Gestión de Clientes
          </h2>
          <button
            onClick={handleAgregarCliente}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold shadow-md hover:shadow-lg"
          >
            <span className="text-xl">+</span>
            Agregar Cliente
          </button>
        </div>

        {loadingClientes ? (
          <div className="text-center py-8 text-gray-500">Cargando clientes...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedClientes.map((cliente) => (
                <div key={cliente.id} className={`bg-white border border-gray-200 rounded-xl shadow p-6 ${!cliente.activo ? 'opacity-50' : 'hover:shadow-lg transition'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🛒</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{cliente.nombre}</h3>
                        <p className="text-sm text-gray-600">{cliente.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                      cliente.activo
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {cliente.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span>Cédula: {cliente.cedula}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCambiarEstadoCliente(cliente)}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
                      cliente.activo
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {cliente.activo ? '🗑️ Suspender' : '✅ Activar'}
                  </button>
                </div>
              ))}
            </div>
            {clientes.length === 0 && (
              <div className="text-center py-12">
                <span className="text-5xl mb-3 block">🛒</span>
                <p className="text-gray-500 text-lg">No hay clientes registrados</p>
                <p className="text-gray-400 text-sm mt-1">Agrega un nuevo cliente para comenzar</p>
              </div>
            )}
          </>
        )}

        {clientes.length > 0 && !loadingClientes && (
          <Pagination
            currentPage={currentPageClientes}
            totalPages={totalPagesClientes}
            onPageChange={setCurrentPageClientes}
            itemsPerPage={itemsPerPage}
            totalItems={clientes.length}
          />
        )}
      </div>

      {/* Modal Agregar Usuario */}
      {showAgregarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border border-gray-200 w-96 shadow-xl rounded-xl bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">➕</span>
                Agregar Nuevo Usuario
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="usuario@coperativa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cédula *</label>
                  <input
                    type="text"
                    required
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="10 dígitos"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rol *</label>
                  <select
                    required
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'CHOFER' | 'OFICINISTA' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="CHOFER">🚗 Chofer</option>
                    <option value="OFICINISTA">📋 Oficinista</option>
                  </select>
                </div>

                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    {modalError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAgregarModal(false)}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-semibold shadow-md"
                  >
                    {submitting ? 'Creando...' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Cliente */}
      {showAgregarClienteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border border-gray-200 w-96 shadow-xl rounded-xl bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">➕</span>
                Agregar Nuevo Cliente
              </h3>
              <form onSubmit={handleSubmitCliente} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={clienteFormData.nombre}
                    onChange={(e) => setClienteFormData({ ...clienteFormData, nombre: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={clienteFormData.email}
                    onChange={(e) => setClienteFormData({ ...clienteFormData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="cliente@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cédula *</label>
                  <input
                    type="text"
                    required
                    value={clienteFormData.cedula}
                    onChange={(e) => setClienteFormData({ ...clienteFormData, cedula: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="10 dígitos"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={clienteFormData.password}
                    onChange={(e) => setClienteFormData({ ...clienteFormData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                </div>

                {modalClienteError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    {modalClienteError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAgregarClienteModal(false)}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCliente}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 font-semibold shadow-md"
                  >
                    {submittingCliente ? 'Creando...' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}