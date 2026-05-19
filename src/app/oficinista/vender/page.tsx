'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Ruta {
  id: string
  fecha: string
  precio: number
  bus: {
    id: string
    numero: string
    placa: string
    capacidad: number
  }
  frecuencia: {
    origen: string
    destino: string
    hora: string
  }
  boletos?: { asiento: string; estado: string }[]
  asientosDisponibles?: number[]
}

type TipoPasajero = 'ADULTO' | 'NINO' | 'TERCERA_EDAD' | 'DISCAPACITADO'
type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA'

export default function VenderBoleto() {
  const { data: session } = useSession()
  const router = useRouter()

  const [origen, setOrigen] = useState('')
  const [destino, setDestino] = useState('')
  const [fecha, setFecha] = useState('')
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null)
  const [asientoSeleccionado, setAsientoSeleccionado] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [tipoPasajero, setTipoPasajero] = useState<TipoPasajero>('ADULTO')
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [paso, setPaso] = useState(1)

  const DESCUENTO: Record<TipoPasajero, number> = {
    ADULTO: 0,
    NINO: 0.5,
    TERCERA_EDAD: 0.5,
    DISCAPACITADO: 0.5,
  }

  const precioFinal = rutaSeleccionada
    ? rutaSeleccionada.precio * (1 - DESCUENTO[tipoPasajero])
    : 0

  async function buscarRutas() {
    if (!origen || !destino || !fecha) {
      setMensaje('Completa todos los campos de búsqueda')
      return
    }
    setCargando(true)
    setMensaje('')
    try {
      const res = await fetch(`/api/rutas?fecha=${fecha}`)
      const todas: Ruta[] = await res.json()
      const origenNorm = origen.trim().toLowerCase()
      const destinoNorm = destino.trim().toLowerCase()
      const filtradas = todas.filter(ruta =>
        ruta.frecuencia.origen.toLowerCase() === origenNorm &&
        ruta.frecuencia.destino.toLowerCase() === destinoNorm
      )
      setRutas(filtradas)
      if (filtradas.length === 0) setMensaje('No hay rutas disponibles para esa búsqueda')
      setPaso(2)
    } catch {
      setMensaje('Error al buscar rutas')
    } finally {
      setCargando(false)
    }
  }

  async function seleccionarRuta(rutaId: string) {
    setCargando(true)
    try {
      const res = await fetch(`/api/rutas/${rutaId}`)
      if (!res.ok) throw new Error('Error al cargar los detalles')
      const rutaCompleta: Ruta = await res.json()
      const ocupados = rutaCompleta.boletos
        ?.filter(b => b.estado === 'APROBADO')
        .map(b => Number(b.asiento)) || []
      const capacidad = rutaCompleta.bus?.capacidad || 40
      const disponibles = Array.from({ length: capacidad }, (_, i) => i + 1)
        .filter(asiento => !ocupados.includes(asiento))
      setRutaSeleccionada({ ...rutaCompleta, asientosDisponibles: disponibles })
      setAsientoSeleccionado(null)
      setPaso(2)
    } catch {
      setMensaje('No se pudieron cargar los asientos')
    } finally {
      setCargando(false)
    }
  }

  async function emitirBoleto() {
    if (!rutaSeleccionada || !asientoSeleccionado || !nombre || !cedula) {
      setMensaje('Completa todos los datos del pasajero')
      return
    }
    setCargando(true)
    setMensaje('')
    try {
      const res = await fetch('/api/boletos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rutaId: rutaSeleccionada.id,
          asiento: asientoSeleccionado,
          nombre,
          cedula,
          tipoPasajero,
          metodoPago,
          precio: precioFinal,
        }),
      })
      if (res.ok) {
        setMensaje('✅ Boleto emitido correctamente')
        setTimeout(() => router.push('/oficinista'), 2000)
      } else {
        const err = await res.json()
        setMensaje(err.error || 'Error al emitir boleto')
      }
    } catch {
      setMensaje('Error al conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Venta de Boletos</h1>

        <div className="flex items-center mb-8 gap-2">
          {['Buscar ruta', 'Seleccionar asiento', 'Datos pasajero'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${paso > i + 1 ? 'bg-green-500 text-white' : paso === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1}
              </div>
              <span className={`text-sm ${paso === i + 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{label}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Paso 1: Buscar ruta */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Buscar ruta</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Origen</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={origen}
                onChange={e => setOrigen(e.target.value)}
                placeholder="Ej: Ambato"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Destino</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={destino}
                onChange={e => setDestino(e.target.value)}
                placeholder="Ej: Quito"
              />
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
          </div>
          <button
            onClick={buscarRutas}
            disabled={cargando}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {cargando ? 'Buscando...' : 'Buscar rutas'}
          </button>
        </div>

        {/* Paso 2: Resultados y selección de asiento */}
        {rutas.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Rutas disponibles</h2>
            <div className="space-y-3 mb-6">
              {rutas.map(ruta => (
                <div
                  key={ruta.id}
                  onClick={() => seleccionarRuta(ruta.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition
                    ${rutaSeleccionada?.id === ruta.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-gray-800">
                        {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">{ruta.frecuencia.hora}</span>
                      <div className="text-xs text-gray-400">
                        Bus: {ruta.bus.numero} ({ruta.bus.placa})
                      </div>
                    </div>
                    <span className="text-blue-600 font-bold">${ruta.precio.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {rutaSeleccionada && rutaSeleccionada.asientosDisponibles && (
              <div>
                <h3 className="text-md font-semibold text-gray-600 mb-3">Selecciona un asiento</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="w-full h-6 bg-gray-300 rounded mb-4 flex items-center justify-center text-xs text-gray-600">
                    FRENTE DEL BUS
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                    {Array.from({ length: rutaSeleccionada.bus.capacidad || 40 }, (_, i) => i + 1).map(num => {
                      const disponible = rutaSeleccionada.asientosDisponibles!.includes(num)
                      return (
                        <button
                          key={num}
                          disabled={!disponible}
                          onClick={() => { setAsientoSeleccionado(num); setPaso(3) }}
                          className={`h-10 rounded text-sm font-medium transition
                            ${!disponible ? 'bg-red-200 text-red-400 cursor-not-allowed' :
                              asientoSeleccionado === num ? 'bg-blue-600 text-white' :
                              'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                          {num}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-4 mt-3 justify-center text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded inline-block" /> Disponible</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-200 rounded inline-block" /> Ocupado</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded inline-block" /> Seleccionado</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paso 3: Datos del pasajero */}
        {asientoSeleccionado && rutaSeleccionada && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Datos del pasajero</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nombre completo</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cédula</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={cedula}
                  onChange={e => setCedula(e.target.value)}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tipo de pasajero</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={tipoPasajero}
                  onChange={e => setTipoPasajero(e.target.value as TipoPasajero)}
                >
                  <option value="ADULTO">Adulto (sin descuento)</option>
                  <option value="NINO">Niño (50% descuento)</option>
                  <option value="TERCERA_EDAD">Tercera edad (50% descuento)</option>
                  <option value="DISCAPACITADO">Discapacitado (50% descuento)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Método de pago</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={metodoPago}
                  onChange={e => setMetodoPago(e.target.value as MetodoPago)}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Resumen de venta</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>Ruta: <span className="font-medium">{rutaSeleccionada.frecuencia.origen} → {rutaSeleccionada.frecuencia.destino}</span></p>
                <p>Hora: <span className="font-medium">{rutaSeleccionada.frecuencia.hora}</span></p>
                <p>Bus: <span className="font-medium">{rutaSeleccionada.bus.numero} ({rutaSeleccionada.bus.placa})</span></p>
                <p>Asiento: <span className="font-medium">{asientoSeleccionado}</span></p>
                <p>Precio base: <span className="font-medium">${rutaSeleccionada.precio.toFixed(2)}</span></p>
                {DESCUENTO[tipoPasajero] > 0 && (
                  <p>Descuento: <span className="font-medium text-green-600">-{DESCUENTO[tipoPasajero] * 100}%</span></p>
                )}
                <p className="text-lg font-bold text-blue-900 pt-1">Total: ${precioFinal.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={emitirBoleto}
              disabled={cargando}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg disabled:opacity-50"
            >
              {cargando ? 'Emitiendo...' : '🎫 Emitir boleto'}
            </button>
          </div>
        )}

        {mensaje && (
          <div className={`rounded-lg p-4 text-center font-medium
            ${mensaje.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensaje}
          </div>
        )}
      </div>
    </div>
  )
}