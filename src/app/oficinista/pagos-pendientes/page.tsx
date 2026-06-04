'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Boleto {
  id: string
  pasajero: {
    nombre: string
    cedula: string
    email: string
  }
  ruta: {
    frecuencia: {
      origen: string
      destino: string
      hora: string
    }
    fecha: string
  }
  asiento: string
  precio: number
  estado: string
}

export default function PagosPendientes() {
  const [boletos, setBoletos] = useState<Boleto[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [filtroRuta, setFiltroRuta] = useState('')
const [filtroMontoMin, setFiltroMontoMin] = useState('')
const [filtroMontoMax, setFiltroMontoMax] = useState('')

  useEffect(() => {
    fetch('/api/boletos/pendientes')
      .then(res => res.json())
      .then(data => { setBoletos(data); setCargando(false) })
      .catch(() => { setMensaje('Error al cargar pagos pendientes'); setCargando(false) })
  }, [])

  if (cargando) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-gray-500">Cargando pagos pendientes...</p>
    </div>
  )
  const boletosFiltrados = boletos.filter(b => {
  if (filtroRuta) {
    const ruta = `${b.ruta.frecuencia.origen} ${b.ruta.frecuencia.destino}`.toLowerCase()
    if (!ruta.includes(filtroRuta.toLowerCase())) return false
  }
  if (filtroMontoMin && b.precio < parseFloat(filtroMontoMin)) return false
  if (filtroMontoMax && b.precio > parseFloat(filtroMontoMax)) return false
  return true
})

  return (
    <div>
      <div className="max-w-4xl mx-auto">
       <h1 className="text-2xl font-bold text-gray-900 mb-6">Pagos Pendientes de Aprobación</h1>

        {mensaje && (
          <div className="bg-red-100 text-red-800 rounded-lg p-4 mb-4">{mensaje}</div>
        )}
        {/* Filtros */}
<div className="bg-white rounded-xl shadow p-4 mb-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm text-gray-600 mb-1">Ruta (origen/destino)</label>
      <input
        className="w-full border rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Ej: Ambato"
        value={filtroRuta}
        onChange={e => setFiltroRuta(e.target.value)}
      />
    </div>
    <div>
      <label className="block text-sm text-gray-600 mb-1">Monto mínimo ($)</label>
      <input
        type="number"
        className="w-full border rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="0.00"
        value={filtroMontoMin}
        onChange={e => setFiltroMontoMin(e.target.value)}
      />
    </div>
    <div>
      <label className="block text-sm text-gray-600 mb-1">Monto máximo ($)</label>
      <input
        type="number"
        className="w-full border rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="999.00"
        value={filtroMontoMax}
        onChange={e => setFiltroMontoMax(e.target.value)}
      />
    </div>
  </div>
</div>


        {boletosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No hay pagos pendientes de aprobación
          </div>
        ) : (
          <div className="space-y-4">
            {boletosFiltrados.map(boleto => (
              <div key={boleto.id} className="bg-white rounded-xl shadow p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{boleto.pasajero.nombre}</p>
                  <p className="text-sm text-gray-500">CI: {boleto.pasajero.cedula}</p>
                  <p className="text-sm text-gray-600">
                    {boleto.ruta.frecuencia.origen} → {boleto.ruta.frecuencia.destino} · {new Date(boleto.ruta.fecha).toLocaleDateString('es-EC')} {boleto.ruta.frecuencia.hora}
                  </p>
                  <p className="text-sm text-gray-600">Asiento: <span className="font-medium">{boleto.asiento}</span></p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-blue-600 font-bold text-lg">${boleto.precio.toFixed(2)}</p>
                  <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                    Pendiente
                  </span>
                  <div>
                    <Link
                      href={`/oficinista/pagos-pendientes/${boleto.id}`}
                      className="inline-block mt-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
                    >
                      Ver comprobante
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
