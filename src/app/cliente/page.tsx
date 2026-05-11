// src/app/cliente/page.tsx
'use client';

import Link from 'next/link';

export default function ClienteDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel del Cliente</h1>
        <p className="text-gray-500 mb-8">Cooperativa Ambato Express</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/cliente/buscar"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition border-2 border-transparent hover:border-blue-300"
          >
            <div className="text-4xl mb-3">🔍</div>
            <h2 className="text-xl font-semibold text-gray-800">Buscar Rutas</h2>
            <p className="text-gray-500 text-sm mt-1">
              Encuentra viajes disponibles por origen, destino y fecha.
            </p>
          </Link>

          <Link
            href="/cliente/mis-compras"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition border-2 border-transparent hover:border-green-300"
          >
            <div className="text-4xl mb-3">🎫</div>
            <h2 className="text-xl font-semibold text-gray-800">Mis Compras</h2>
            <p className="text-gray-500 text-sm mt-1">
              Revisa el historial y estado de tus boletos.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}