'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { obtenerErrorCedula, obtenerErrorEmailCoperativa, obtenerErrorContrasena, obtenerErrorConfirmacionContrasena, validarEmail } from '@/lib/validations'
import TableSkeleton from '@/components/TableSkeleton'

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
    confirmPassword: '',
    rol: 'CHOFER' as 'CHOFER' | 'OFICINISTA'
  })
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    nombre: '',
    email: '',
    cedula: '',
    password: '',
    confirmPassword: ''
  })

  // Modal agregar cliente
  const [showAgregarClienteModal, setShowAgregarClienteModal] = useState(false)
  const [modalClienteError, setModalClienteError] = useState('')
  const [clienteFormData, setClienteFormData] = useState({
    nombre: '',
    email: '',
    cedula: '',
    password: '',
    confirmPassword: ''
  })
  const [submittingCliente, setSubmittingCliente] = useState(false)
  const [clienteFieldErrors, setClienteFieldErrors] = useState({
    nombre: '',
    email: '',
    cedula: '',
    password: '',
    confirmPassword: ''
  })

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
    setFieldErrors({ nombre: '', email: '', cedula: '', password: '', confirmPassword: '' })
    setFormData({
      nombre: '',
      email: '',
      cedula: '',
      password: '',
      confirmPassword: '',
      rol: 'CHOFER'
    })
    setShowAgregarModal(true)
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Validación en vivo
    let error = ''
    if (field === 'cedula') {
      error = obtenerErrorCedula(value)
    } else if (field === 'email') {
      error = obtenerErrorEmailCoperativa(value)
    } else if (field === 'password') {
      error = obtenerErrorContrasena(value)
      // También validar confirmación si ya tiene valor
      if (formData.confirmPassword) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: obtenerErrorConfirmacionContrasena(value, formData.confirmPassword)
        }))
      }
    } else if (field === 'confirmPassword') {
      error = obtenerErrorConfirmacionContrasena(formData.password, value)
    }
    
    setFieldErrors(prev => ({ ...prev, [field]: error }))
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
          confirmPassword: '',
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
    setClienteFieldErrors({ nombre: '', email: '', cedula: '', password: '', confirmPassword: '' })
    setClienteFormData({
      nombre: '',
      email: '',
      cedula: '',
      password: '',
      confirmPassword: ''
    })
    setShowAgregarClienteModal(true)
  }

  const handleClienteFieldChange = (field: string, value: string) => {
    setClienteFormData(prev => ({ ...prev, [field]: value }))
    
    // Validación en vivo
    let error = ''
    if (field === 'cedula') {
      error = obtenerErrorCedula(value)
    } else if (field === 'email') {
      error = !validarEmail(value) ? 'Email inválido' : ''
    } else if (field === 'password') {
      error = obtenerErrorContrasena(value)
      // También validar confirmación si ya tiene valor
      if (clienteFormData.confirmPassword) {
        setClienteFieldErrors(prev => ({
          ...prev,
          confirmPassword: obtenerErrorConfirmacionContrasena(value, clienteFormData.confirmPassword)
        }))
      }
    } else if (field === 'confirmPassword') {
      error = obtenerErrorConfirmacionContrasena(clienteFormData.password, value)
    }
    
    setClienteFieldErrors(prev => ({ ...prev, [field]: error }))
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
          password: '',
          confirmPassword: ''
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
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          </div>
        </div>
        <TableSkeleton rows={5} columns={6} />
      </div>
    )
  }

  // ---------- JSX principal ----------
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin"
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        </div>
        <button
          onClick={handleAgregar}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Agregar Usuario
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Tabla de Usuarios (Choferes y Oficinistas) */}
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className={!usuario.activo ? 'opacity-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {usuario.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.cedula}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    usuario.rol === 'CHOFER' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {usuario.rol === 'CHOFER' ? 'Chofer' : 'Oficinista'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    usuario.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleCambiarEstado(usuario)}
                    className={`${
                      usuario.activo 
                        ? 'text-red-600 hover:text-red-900' 
                        : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {usuario.activo ? 'Suspender' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay usuarios registrados
          </div>
        )}
      </div>

      {/* Sección de Clientes */}
      <div className="bg-white rounded-lg shadow mt-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Clientes</h2>
          <button
            onClick={handleAgregarCliente}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Agregar Cliente
          </button>
        </div>

        {loadingClientes ? (
          <div className="text-center py-8 text-gray-500">Cargando clientes...</div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className={!cliente.activo ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cliente.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.cedula}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Cliente
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cliente.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleCambiarEstadoCliente(cliente)}
                        className={`${
                          cliente.activo
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {cliente.activo ? 'Suspender' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {clientes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay clientes registrados
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Agregar Usuario */}
      {showAgregarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nuevo Usuario</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => handleFieldChange('nombre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                      fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="usuario@coperativa.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
                  <input
                    type="text"
                    required
                    value={formData.cedula}
                    onChange={(e) => handleFieldChange('cedula', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                      fieldErrors.cedula ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="10 dígitos"
                    maxLength={10}
                  />
                  {fieldErrors.cedula && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.cedula}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-gray-900 ${
                      fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    minLength={6}
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-gray-900 ${
                      fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    minLength={6}
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                  <select
                    required
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'CHOFER' | 'OFICINISTA' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="CHOFER">Chofer</option>
                    <option value="OFICINISTA">Oficinista</option>
                  </select>
                </div>

                {modalError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                    {modalError}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAgregarModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nuevo Cliente</h3>
              <form onSubmit={handleSubmitCliente}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={clienteFormData.nombre}
                    onChange={(e) => handleClienteFieldChange('nombre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={clienteFormData.email}
                    onChange={(e) => handleClienteFieldChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                      clienteFieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    }`}
                    placeholder="cliente@email.com"
                  />
                  {clienteFieldErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{clienteFieldErrors.email}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
                  <input
                    type="text"
                    required
                    value={clienteFormData.cedula}
                    onChange={(e) => handleClienteFieldChange('cedula', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                      clienteFieldErrors.cedula ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    }`}
                    placeholder="10 dígitos"
                    maxLength={10}
                  />
                  {clienteFieldErrors.cedula && (
                    <p className="mt-1 text-xs text-red-600">{clienteFieldErrors.cedula}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={clienteFormData.password}
                    onChange={(e) => handleClienteFieldChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-gray-900 ${
                      clienteFieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    }`}
                    minLength={6}
                  />
                  {clienteFieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{clienteFieldErrors.password}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={clienteFormData.confirmPassword}
                    onChange={(e) => handleClienteFieldChange('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-gray-900 ${
                      clienteFieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    }`}
                    minLength={6}
                  />
                  {clienteFieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{clienteFieldErrors.confirmPassword}</p>
                  )}
                </div>

                {modalClienteError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                    {modalClienteError}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAgregarClienteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCliente}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
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