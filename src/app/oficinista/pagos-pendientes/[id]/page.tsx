'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Boleto {
  id: string
  pasajero: string
  cedula: string
  ruta: {
    origen: string
    destino: string
    fecha: string
    hora: string
  }
  asiento: number
  precio: number
  comprobante: string
  estado: string
}

export default function DetallePago() {
  const { id } = useParams()
  const router = useRouter()
  const [boleto, setBoleto] = useState<Boleto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [aprobando, setAprobando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [imagenGrande, setImagenGrande] = useState(false)

  useEffect(() => {
    fetch(`/api/boletos/pendientes`)
      .then(res => res.json())
      .then((data: Boleto[]) => {
        const encontrado = data.find(b => b.id === id)
        setBoleto(encontrado || null)
        setCargando(false)
      })
      .catch(() => { setMensaje('Error al cargar el boleto'); setCargando(false) })
  }, [id])

  async function aprobarPago() {
    setAprobando(true)
    setMensaje('')
    try {
      const res = await fetch(`/api/boletos/${id}/aprobar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        setMensaje('✅ Pago aprobado. QR generado correctamente.')
        setTimeout(() => router.push('/oficinista/pagos-pendientes'), 2000)
      } else {
        const err = await res.json()
        setMensaje(err.error || 'Error al aprobar el pago')
      }
    } catch {
      setMensaje('Error al conectar con el servidor')
    } finally {
      setAprobando(false)
    }
  }

  if (cargando) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Cargando detalle...</p>
    </div>
  )

  if (!boleto) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-red-500">Boleto no encontrado</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-4 flex items-center gap-1 text-sm"
        >
          ← Volver a pagos pendientes
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Detalle de Pago</h1>

        {/* Info del boleto */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Información del boleto</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Pasajero:</span> <span className="font-medium">{boleto.pasajero}</span></div>
            <div><span className="text-gray-500">Cédula:</span> <span className="font-medium">{boleto.cedula}</span></div>
            <div><span className="text-gray-500">Ruta:</span> <span className="font-medium">{boleto.ruta.origen} → {boleto.ruta.destino}</span></div>
            <div><span className="text-gray-500">Fecha:</span> <span className="font-medium">{boleto.ruta.fecha}</span></div>
            <div><span className="text-gray-500">Hora:</span> <span className="font-medium">{boleto.ruta.hora}</span></div>
            <div><span className="text-gray-500">Asiento:</span> <span className="font-medium">{boleto.asiento}</span></div>
            <div><span className="text-gray-500">Total:</span> <span className="font-bold text-blue-600">${boleto.precio.toFixed(2)}</span></div>
            <div>
              <span className="text-gray-500">Estado:</span>{' '}
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">Pendiente</span>
            </div>
          </div>
        </div>

        {/* Comprobante */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Comprobante de pago</h2>
          {boleto.comprobante ? (
            <div>
              <img
                src={boleto.comprobante}
                alt="Comprobante de pago"
                className="w-full max-h-64 object-contain rounded-lg border cursor-pointer hover:opacity-90 transition"
                onClick={() => setImagenGrande(true)}
              />
              <p className="text-xs text-gray-400 mt-2 text-center">Click en la imagen para verla más grande</p>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-400">
              No hay comprobante adjunto
            </div>
          )}
        </div>

         {/* Botón aprobar */}
        {mensaje ? (
          <div className={`rounded-lg p-4 text-center font-medium mb-4
            ${mensaje.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje}
          </div>
        ) : (
          <button
            onClick={aprobarPago}
            disabled={aprobando}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg disabled:opacity-50"
          >
            {aprobando ? 'Aprobando...' : '✅ Aprobar pago'}
          </button>
        )}

        {/* Modal imagen grande */}
        {imagenGrande && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={() => setImagenGrande(false)}
          >
            <div className="max-w-3xl w-full p-4">
              <img
                src={boleto.comprobante}
                alt="Comprobante grande"
                className="w-full rounded-lg"
              />
              <p className="text-white text-center mt-2 text-sm">Click para cerrar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
