'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Parada {
  id: string
  ciudad: string
  orden: number
}

interface Frecuencia {
  id: string
  origen: string
  destino: string
  hora: string
  tipoViaje: 'DIRECTO' | 'CON_PARADAS'
  activa: boolean
  paradas: Parada[]
}

export default function FrecuenciasPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [frecuencias, setFrecuencias] = useState<Frecuencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    cargarFrecuencias()
  }, [session, router])

  const cargarFrecuencias = async () => {
    try {
      const response = await fetch('/api/frecuencias')
      if (response.ok) {
        const data = await response.json()
        setFrecuencias(data)
      } else {
        setError('Error al cargar las frecuencias')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (frecuencia: Frecuencia) => {
    if (!confirm(`¿Estás seguro de eliminar la frecuencia ${frecuencia.origen}-${frecuencia.destino} ${frecuencia.hora}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/frecuencias/${frecuencia.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await cargarFrecuencias()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al eliminar la frecuencia')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
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
          <h1 className="text-2xl font-bold">Gestión de Frecuencias</h1>
        </div>
        <Link
          href="/admin/frecuencias/agregar"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Agregar Frecuencia
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destino
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo de Viaje
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paradas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {frecuencias.map((frecuencia) => (
              <tr key={frecuencia.id} className={!frecuencia.activa ? 'opacity-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {frecuencia.origen}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {frecuencia.destino}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {frecuencia.hora}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    frecuencia.tipoViaje === 'DIRECTO' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {frecuencia.tipoViaje === 'DIRECTO' ? 'Directo' : 'Con Paradas'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {frecuencia.tipoViaje === 'CON_PARADAS' && frecuencia.paradas && frecuencia.paradas.length > 0
                    ? frecuencia.paradas.map(p => p.ciudad).join(', ')
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    frecuencia.activa 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {frecuencia.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/admin/frecuencias/editar/${frecuencia.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </Link>
                  {frecuencia.activa ? (
                    <button
                      onClick={() => handleEliminar(frecuencia)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  ) : (
                    <span className="text-gray-400">Inactiva</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {frecuencias.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay frecuencias registradas
          </div>
        )}
      </div>
    </div>
  )
}
