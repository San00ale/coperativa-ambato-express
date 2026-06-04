"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { esFechaPasada, getFechaHoy } from "@/lib/validations";

interface Frecuencia {
  origen: string;
  destino: string;
  hora: string;
  tipoViaje: string;
}

interface Bus {
  numero: string;
  capacidad: number;
}

interface Boleto {
  id: string;
  estado: string;
}

interface Ruta {
  id: string;
  fecha: string;
  frecuencia: Frecuencia;
  bus: Bus;
  boletos: Boleto[];
}

export default function BuscarRutasPage() {
  const router = useRouter();

  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState("");
  const [errorFecha, setErrorFecha] = useState("");

  const [resultados, setResultados] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buscado, setBuscado] = useState(false);
  const [ciudadesOrigen, setCiudadesOrigen] = useState<string[]>([]);
  const [ciudadesDestino, setCiudadesDestino] = useState<string[]>([]);

  useEffect(() => {
    const cargarCiudades = async () => {
      try {
        const res = await fetch("/api/frecuencias");
        const data: { origen: string; destino: string }[] = await res.json();
        const origenes = [...new Set(data.map((f) => f.origen))].sort();
        const destinos = [...new Set(data.map((f) => f.destino))].sort();
        setCiudadesOrigen(origenes);
        setCiudadesDestino(destinos);
      } catch {
        console.error("No se pudieron cargar las ciudades");
      }
    };
    cargarCiudades();
  }, []);

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setFecha(valor);
    if (valor && esFechaPasada(valor)) {
      setErrorFecha("❌ No se pueden buscar rutas en fechas pasadas.");
    } else {
      setErrorFecha("");
    }
  };

  const buscarHabilitado =
    !!origen &&
    !!destino &&
    !!fecha &&
    !errorFecha &&
    origen !== destino &&
    !loading;

  const handleBuscar = async () => {
    if (!buscarHabilitado) return;

    setError("");
    setLoading(true);
    setBuscado(false);

    try {
      const res = await fetch(
        `/api/rutas?origen=${origen}&destino=${destino}&fecha=${fecha}`
      );
      if (!res.ok) throw new Error("Error en la respuesta");
      const data: Ruta[] = await res.json();
      setResultados(data);
      setBuscado(true);
    } catch {
      setError("Error al buscar rutas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const getAsientosDisponibles = (ruta: Ruta) => {
    return ruta.bus.capacidad - ruta.boletos.length;
  };

  const handleSeleccionar = (rutaId: string) => {
    router.push(`/cliente/seleccionar-asiento?rutaId=${rutaId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Buscar Rutas</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Origen */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Origen
              </label>
              <select
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona ciudad</option>
                {ciudadesOrigen.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>
            </div>

            {/* Destino */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Destino
              </label>
              <select
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona ciudad</option>
                {ciudadesDestino.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha nativa */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                min={getFechaHoy()}
                onChange={handleFechaChange}
                className={`w-full border rounded-md p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errorFecha ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errorFecha && (
                <p className="text-red-600 text-xs mt-1">{errorFecha}</p>
              )}
            </div>
          </div>

          {origen === destino && origen !== "" && (
            <p className="text-red-600 text-sm mt-3">
              ❌ El origen y destino no pueden ser iguales.
            </p>
          )}

          {error && <p className="text-red-700 text-sm mt-3">{error}</p>}

          <button
            onClick={handleBuscar}
            disabled={!buscarHabilitado}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {buscado && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Resultados ({resultados.length})
            </h2>

            {resultados.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No hay rutas disponibles para esa búsqueda.
              </div>
            ) : (
              <div className="space-y-3">
                {resultados.map((ruta) => {
                  const asientos = getAsientosDisponibles(ruta);
                  return (
                    <div
                      key={ruta.id}
                      className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          🕐 {ruta.frecuencia.hora} &nbsp;|&nbsp; 🚌 Bus #{ruta.bus.numero}
                        </p>
                        <p className="text-sm mt-1">
                          <span
                            className={
                              asientos > 0
                                ? "text-green-600 font-medium"
                                : "text-red-500 font-medium"
                            }
                          >
                            {asientos > 0
                              ? `${asientos} asientos disponibles`
                              : "Sin asientos disponibles"}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleSeleccionar(ruta.id)}
                        disabled={asientos === 0}
                        className="ml-4 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Seleccionar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}