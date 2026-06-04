'use client'

import { useState, useEffect } from 'react'

interface Frecuencia {
  id: string
  origen: string
  destino: string
  hora: string
  duracion?: number
}
interface Bus {
  id: string
  placa: string
  capacidad: number
}

interface Chofer {
  id: string
  nombre: string
}

interface Ruta {
  id: string
  fecha: string
  busId: string
  bus: { placa: string }
  frecuencia: { origen: string; destino: string; hora: string; duracion?: number }
  precio?: number
}

export default function HojaRuta() {
  const [frecuencias, setFrecuencias] = useState<Frecuencia[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [choferes, setChoferes] = useState<Chofer[]>([])
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [frecuenciaId, setFrecuenciaId] = useState('')
  const [busId, setBusId] = useState('')
  const [fecha, setFecha] = useState('')
  const [precio, setPrecio] = useState('')
  const [choferId, setChoferId] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [reasignando, setReasignando] = useState<string | null>(null)
  const [nuevoBusId, setNuevoBusId] = useState('')
  const [mostrarModalReasignar, setMostrarModalReasignar] = useState(false)
const [rutaAReasignar, setRutaAReasignar] = useState<string | null>(null)
  const obtenerFechaLocal = () => new Date().toLocaleDateString('en-CA')
const [fechaFiltro, setFechaFiltro] = useState(obtenerFechaLocal())

  useEffect(() => {
    fetch('/api/frecuencias').then(r => r.json()).then(setFrecuencias).catch(() => {})
    fetch('/api/buses').then(r => r.json()).then(setBuses).catch(() => {})
    fetch('/api/admin/usuarios?rol=CHOFER')
      .then(r => r.json())
      .then(setChoferes)
      .catch(() => {})
    const hoy = new Date().toLocaleDateString('en-CA')
    cargarRutas(hoy)
  }, [])

  async function cargarRutas(fechaBuscar: string) {
  try {
    const res = await fetch(`/api/rutas?fecha=${fechaBuscar}`)
    const data = await res.json()
    if (Array.isArray(data)) {
      setRutas(data)
    } else {
      setRutas([])
      setMensaje('Error al cargar las rutas')
    }
  } catch {
    setMensaje('Error al cargar las rutas')
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
          precio: parseFloat(precio),
          choferId: choferId || null
        }),
      })
      if (res.ok) {
        setMensaje('✅ Ruta creada correctamente')
        setFrecuenciaId('')
        setBusId('')
        setFecha('')
        setPrecio('')
        setChoferId('')
        await cargarRutas(fechaFiltro)
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
        await cargarRutas(fechaFiltro)
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
            <div>
              <label className="block text-sm text-gray-600 mb-1">Chofer</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={choferId}
                onChange={e => setChoferId(e.target.value)}
              >
                <option value="">Seleccionar chofer...</option>
                {choferes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
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

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-semibold text-gray-700">Rutas del día</h2>
  <input
    type="date"
    className="border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
    value={fechaFiltro}
    onChange={e => { setFechaFiltro(e.target.value); cargarRutas(e.target.value) }}
  />
</div>
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
  {ruta.frecuencia.duracion && ` · Duración: ${ruta.frecuencia.duracion} min`}
</p>
                    </div>
                    <button
                      onClick={() => { setRutaAReasignar(ruta.id); setNuevoBusId(''); setMostrarModalReasignar(true) }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Reasignar bus
                    </button>
                  </div>
              
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
       {/* Modal reasignar bus */}
{mostrarModalReasignar && rutaAReasignar && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
      <h3 className="font-semibold text-gray-900 mb-4">Reasignar bus</h3>
      <label className="block text-sm text-gray-600 mb-1">Nuevo bus</label>
      <select
        className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
        value={nuevoBusId}
        onChange={e => setNuevoBusId(e.target.value)}
      >
        <option value="">Seleccionar bus...</option>
        {buses.map(b => (
          <option key={b.id} value={b.id}>
            {b.placa} ({b.capacidad} asientos)
          </option>
        ))}
      </select>
      <div className="flex gap-3">
        <button
          onClick={() => { setMostrarModalReasignar(false); setRutaAReasignar(null); setNuevoBusId('') }}
          className="flex-1 border rounded-lg py-2 text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={() => { reasignarBus(rutaAReasignar); setMostrarModalReasignar(false) }}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg py-2 font-medium"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
)} 
      </div>
    </div>
  )
}