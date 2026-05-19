'use client'

import { useState, useEffect } from 'react'

interface Frecuencia {
  id: string
  origen: string
  destino: string
  hora: string
}

interface Bus {
  id: string
  placa: string
  capacidad: number
}

interface Ruta {
  id: string
  fecha: string
  busId: string
  bus: { placa: string }
  frecuencia: { origen: string; destino: string; hora: string }
  precio?: number
}

export default function HojaRuta() {
  const [frecuencias, setFrecuencias] = useState<Frecuencia[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [frecuenciaId, setFrecuenciaId] = useState('')
  const [busId, setBusId] = useState('')
  const [fecha, setFecha] = useState('')
  const [precio, setPrecio] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [reasignando, setReasignando] = useState<string | null>(null)
  const [nuevoBusId, setNuevoBusId] = useState('')

  // Obtener fecha local en formato YYYY-MM-DD (sin zona horaria)
  const obtenerFechaLocal = () => new Date().toLocaleDateString('en-CA')

  useEffect(() => {
    fetch('/api/frecuencias').then(r => r.json()).then(setFrecuencias).catch(() => {})
    fetch('/api/buses').then(r => r.json()).then(setBuses).catch(() => {})
    cargarRutasHoy()
  }, [])

  async function cargarRutasHoy() {
    const hoy = obtenerFechaLocal()
    try {
      const res = await fetch(`/api/rutas?fecha=${hoy}`)
      const data = await res.json()
      setRutas(data)
    } catch (error) {
      console.error('Error al cargar rutas:', error)
      setMensaje('Error al cargar las rutas de hoy')
    }
  }

  async function crearRuta() {
    if (!frecuenciaId || !busId || !fecha || !precio) {
      setMensaje('Completa todos los campos (frecuencia, bus, fecha, precio)')
      return
    }
    setCargando(true)
    setMensaje('')
    try {
      const res = await fetch('/api/rutas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frecuenciaId,
          busId,
          fecha,
          precio: parseFloat(precio)
        }),
      })
      if (res.ok) {
        setMensaje('✅ Ruta creada correctamente')
        setFrecuenciaId('')
        setBusId('')
        setFecha('')
        setPrecio('')
        await cargarRutasHoy()  // Recargar listado inmediatamente
      } else {
        const err = await res.json()
        setMensaje(err.error || 'Error al crear ruta')
      }
    } catch {
      setMensaje('Error al conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  async function reasignarBus(rutaId: string) {
    if (!nuevoBusId) {
      setMensaje('Selecciona un bus')
      return
    }
    try {
      const res = await fetch(`/api/rutas/${rutaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busId: nuevoBusId }),
      })
      if (res.ok) {
        setMensaje('✅ Bus reasignado correctamente')
        setReasignando(null)
        setNuevoBusId('')
        await cargarRutasHoy()
      } else {
        setMensaje('Error al reasignar bus')
      }
    } catch {
      setMensaje('Error al conectar con el servidor')
    }
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Hoja de Ruta</h1>

        {/* Formulario crear ruta */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Crear nueva ruta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Frecuencia</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={frecuenciaId}
                onChange={e => setFrecuenciaId(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {frecuencias.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.origen} → {f.destino} ({f.hora})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bus</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={busId}
                onChange={e => setBusId(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {buses.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.placa} ({b.capacidad} asientos)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                placeholder="Ej: 5.00"
              />
            </div>
          </div>
          <button
            onClick={crearRuta}
            disabled={cargando}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {cargando ? 'Creando...' : 'Crear ruta'}
          </button>
        </div>

        {/* Listado de rutas del día */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Rutas de hoy</h2>
          {rutas.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No hay rutas programadas para hoy</p>
          ) : (
            <div className="space-y-3">
              {rutas.map(ruta => (
                <div key={ruta.id} className="border rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ruta.frecuencia.hora} · Bus: {ruta.bus?.placa}
                        {ruta.precio && ` · Precio: $${ruta.precio.toFixed(2)}`}
                      </p>
                    </div>
                    <button
                      onClick={() => { setReasignando(ruta.id); setNuevoBusId('') }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Reasignar bus
                    </button>
                  </div>

                  {reasignando === ruta.id && (
                    <div className="mt-3 pt-3 border-t flex flex-wrap gap-3 items-center">
                      <select
                        className="flex-1 min-w-[150px] border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        value={nuevoBusId}
                        onChange={e => setNuevoBusId(e.target.value)}
                      >
                        <option value="">Seleccionar nuevo bus...</option>
                        {buses.filter(b => b.id !== ruta.busId).map(b => (
                          <option key={b.id} value={b.id}>
                            {b.placa} ({b.capacidad} asientos)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => reasignarBus(ruta.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setReasignando(null)}
                        className="text-gray-500 hover:text-gray-700 text-sm px-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {mensaje && (
          <div className={`mt-4 rounded-lg p-4 text-center font-medium
            ${mensaje.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje}
          </div>
        )}
      </div>
    </div>
  )
}