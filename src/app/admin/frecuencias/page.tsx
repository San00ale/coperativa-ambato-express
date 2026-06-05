'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TableSkeleton } from '@/components/Skeleton'
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

  if (loading) {
    return <TableSkeleton rows={5} />
  }

  // Calculate pagination
  const totalPages = Math.ceil(frecuencias.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFrecuencias = frecuencias.slice(startIndex, endIndex)

  return (
    <div>
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
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Origen</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Destino</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo de Viaje</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Paradas</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedFrecuencias.map((frecuencia) => (
                <tr key={frecuencia.id} className={!frecuencia.activa ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50 transition'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{frecuencia.origen}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{frecuencia.destino}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{frecuencia.hora}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${frecuencia.tipoViaje === 'DIRECTO' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-purple-100 text-purple-800 border border-purple-200'}`}>
                      {frecuencia.tipoViaje === 'DIRECTO' ? '🚀 Directo' : '🚌 Con Paradas'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {frecuencia.tipoViaje === 'CON_PARADAS' && frecuencia.paradas && frecuencia.paradas.length > 0
                      ? frecuencia.paradas.map(p => p.ciudad).join(', ')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${frecuencia.activa ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                      {frecuencia.activa ? '✅ Activa' : '❌ Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/frecuencias/editar/${frecuencia.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium mr-4">
                      ✏️ Editar
                    </Link>
                    {frecuencia.activa ? (
                      <button onClick={() => handleEliminar(frecuencia)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium">
                        🗑️ Eliminar
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Inactiva</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {frecuencias.length === 0 && (
            <div className="text-center py-12">
              <span className="text-5xl mb-3 block">📋</span>
              <p className="text-gray-500 text-lg">No hay frecuencias registradas</p>
              <p className="text-gray-400 text-sm mt-1">Agrega una nueva frecuencia para comenzar</p>
            </div>
          )}
        </div>
      </div>

      {frecuencias.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={frecuencias.length}
        />
      )}
    </div>
  )
}
