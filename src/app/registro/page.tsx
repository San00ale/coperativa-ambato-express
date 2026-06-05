'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  validarCedulaEcuatoriana,
  obtenerErrorCedula,
  obtenerErrorNombre,
  validarEmail,
  obtenerErrorContrasena,
  obtenerErrorConfirmacionContrasena
} from '@/lib/validations'

export default function RegistroPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [cedula, setCedula] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Validaciones en vivo
  const [touched, setTouched] = useState({
    nombre: false,
    email: false,
    cedula: false,
    password: false,
    confirmPassword: false
  })

  const getErrorNombre = () => touched.nombre ? obtenerErrorNombre(nombre) : ''
  const getErrorEmail = () => touched.email ? (validarEmail(email) ? '' : 'Email inválido') : ''
  const getErrorCedula = () => touched.cedula ? obtenerErrorCedula(cedula) : ''
  const getErrorPassword = () => touched.password ? obtenerErrorContrasena(password) : ''
  const getErrorConfirmPassword = () => touched.confirmPassword ? obtenerErrorConfirmacionContrasena(password, confirmPassword) : ''

  const isFormValid = () => {
    return (
      obtenerErrorNombre(nombre) === '' &&
      validarEmail(email) &&
      obtenerErrorCedula(cedula) === '' &&
      obtenerErrorContrasena(password) === '' &&
      obtenerErrorConfirmacionContrasena(password, confirmPassword) === ''
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Marcar todos los campos como touched
    setTouched({
      nombre: true,
      email: true,
      cedula: true,
      password: true,
      confirmPassword: true
    })

    if (!isFormValid()) {
      setError('Por favor, corrige los errores antes de continuar')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, cedula, password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/login?registered=true')
      } else {
        setError(data.error || 'Error al registrar usuario')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Crear Cuenta</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-gray-900 mb-1 font-medium">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={() => setTouched({ ...touched, nombre: true })}
              placeholder="Tu nombre completo"
              className={`w-full px-3 py-2 border rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorNombre() ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {getErrorNombre() && (
              <p className="text-red-600 text-xs mt-1">{getErrorNombre()}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-900 mb-1 font-medium">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              placeholder="tu@correo.com"
              className={`w-full px-3 py-2 border rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorEmail() ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {getErrorEmail() && (
              <p className="text-red-600 text-xs mt-1">{getErrorEmail()}</p>
            )}
          </div>

          <div>
            <label htmlFor="cedula" className="block text-gray-900 mb-1 font-medium">Cédula</label>
            <input
              id="cedula"
              type="text"
              value={cedula}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setCedula(value)
              }}
              onBlur={() => setTouched({ ...touched, cedula: true })}
              placeholder="10 dígitos"
              maxLength={10}
              className={`w-full px-3 py-2 border rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorCedula() ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {getErrorCedula() && (
              <p className="text-red-600 text-xs mt-1">{getErrorCedula()}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-900 mb-1 font-medium">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, password: true })}
              placeholder="Mínimo 6 caracteres"
              className={`w-full px-3 py-2 border rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorPassword() ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {getErrorPassword() && (
              <p className="text-red-600 text-xs mt-1">{getErrorPassword()}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-900 mb-1 font-medium">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, confirmPassword: true })}
              placeholder="Repite tu contraseña"
              className={`w-full px-3 py-2 border rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorConfirmPassword() ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {getErrorConfirmPassword() && (
              <p className="text-red-600 text-xs mt-1">{getErrorConfirmPassword()}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 hover:underline font-medium">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}