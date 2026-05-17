'use client'

import Link from 'next/link'

export default function DashboardOficinista() {
  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Panel Oficinista</h1>
        <p className="text-gray-500 mb-8">Cooperativa Ambato Express</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/oficinista/vender"
            className="bg-white rounded-xl shadow p-6 hover:shadow-md transition hover:border-blue-300 border-2 border-transparent">
            <div className="text-4xl mb-3">🎫</div>
            <h2 className="text-lg font-semibold text-gray-800">Vender Boleto</h2>
            <p className="text-sm text-gray-500 mt-1">Venta rápida de boletos con selección de asiento</p>
          </Link>

          <Link href="/oficinista/pagos-pendientes"
            className="bg-white rounded-xl shadow p-6 hover:shadow-md transition hover:border-yellow-300 border-2 border-transparent">
            <div className="text-4xl mb-3">💳</div>
            <h2 className="text-lg font-semibold text-gray-800">Pagos Pendientes</h2>
            <p className="text-sm text-gray-500 mt-1">Aprobar comprobantes de transferencia</p>
          </Link>

          <Link href="/oficinista/hoja-ruta"
            className="bg-white rounded-xl shadow p-6 hover:shadow-md transition hover:border-green-300 border-2 border-transparent">
            <div className="text-4xl mb-3">🚌</div>
            <h2 className="text-lg font-semibold text-gray-800">Hoja de Ruta</h2>
            <p className="text-sm text-gray-500 mt-1">Crear rutas y reasignar buses</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
