'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TableSkeleton from '@/components/TableSkeleton'
import Pagination from '@/components/Pagination'

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
  duracion?: number | null
  precioBase?: number | null
}

export default function FrecuenciasPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [frecuencias, setFrecuencias] = useState<Frecuencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const cargarFrecuencias = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    const iniciarCarga = async () => {
      await cargarFrecuencias()
    }

    void iniciarCarga()
  }, [session, router, cargarFrecuencias])

  const handleEliminar = async (frecuencia: Frecuencia) => {
    if (!confirm(`¿Estás seguro de eliminar la frecuencia ${frecuencia.origen}-${frecuencia.destino} ${frecuencia.hora}?`)) return
    try {
      const response = await fetch(`/api/frecuencias/${frecuencia.id}`, { method: 'DELETE' })
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

  const handleToggleEstado = async (frecuencia: Frecuencia) => {
    const nuevoEstado = !frecuencia.activa
    const accion = nuevoEstado ? 'activar' : 'desactivar'
    if (!confirm(`¿Estás seguro de ${accion} la frecuencia ${frecuencia.origen}-${frecuencia.destino} ${frecuencia.hora}?`)) return
    try {
      const response = await fetch(`/api/frecuencias/${frecuencia.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activa: nuevoEstado })
      })
      if (response.ok) {
        await cargarFrecuencias()
      } else {
        const errorData = await response.json()
        setError(errorData.error || `Error al ${accion} la frecuencia`)
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  // Calcular frecuencias paginadas
  const totalPages = Math.ceil(frecuencias.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFrecuencias = frecuencias.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Frecuencias</h1>
        </div>
        <TableSkeleton rows={5} columns={9} />
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Frecuencias</h1>
        <Link
          href="/admin/frecuencias/agregar"
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
        >
          <span className="text-xl">+</span>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Origen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Destino</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Duración</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Precio Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tipo de Viaje</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paradas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedFrecuencias.map((frecuencia) => (
              <tr key={frecuencia.id} className={!frecuencia.activa ? 'opacity-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{frecuencia.origen}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{frecuencia.destino}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{frecuencia.hora}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {frecuencia.duracion ? `${frecuencia.duracion} min` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {frecuencia.precioBase ? `$${frecuencia.precioBase.toFixed(2)}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${frecuencia.tipoViaje === 'DIRECTO' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {frecuencia.tipoViaje === 'DIRECTO' ? 'Directo' : 'Con Paradas'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {frecuencia.tipoViaje === 'CON_PARADAS' && frecuencia.paradas && frecuencia.paradas.length > 0
                    ? frecuencia.paradas.map(p => p.ciudad).join(', ')
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${frecuencia.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {frecuencia.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {frecuencia.activa ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/frecuencias/editar/${frecuencia.id}`}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition text-sm font-medium"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleToggleEstado(frecuencia)}
                        className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition text-sm font-medium"
                      >
                        Desactivar
                      </button>
                      <button
                        onClick={() => handleEliminar(frecuencia)}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggleEstado(frecuencia)}
                      className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition text-sm font-medium"
                    >
                      Activar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {frecuencias.length === 0 && <div className="text-center py-8 text-gray-500">No hay frecuencias registradas</div>}
      </div>

      {frecuencias.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={frecuencias.length}
        />
      )}
    </div>
  )
}
