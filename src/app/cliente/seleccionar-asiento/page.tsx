"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Bus {
  id: string;
  numero: string;
  capacidad: number;
  asientosVIP: number;
}

interface Frecuencia {
  origen: string;
  destino: string;
  hora: string;
}

interface BoletoOcupado {
  asiento: string;
  estado: string;
}

interface Ruta {
  id: string;
  fecha: string;
  bus: Bus;
  frecuencia: Frecuencia;
  boletos: BoletoOcupado[];
}
export default function SeleccionarAsientoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rutaId = searchParams.get("rutaId");

  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [asientoSeleccionado, setAsientoSeleccionado] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!rutaId) {
      setError("No se especificó una ruta.");
      setLoading(false);
      return;
    }

    const cargarRuta = async () => {
      try {
        const res = await fetch(`/api/rutas?rutaId=${rutaId}`);
        const data: Ruta[] = await res.json();
        const rutaEncontrada = data.find((r) => r.id === rutaId);
        if (!rutaEncontrada) throw new Error("Ruta no encontrada");
        setRuta(rutaEncontrada);
      } catch {
        setError("No se pudo cargar la ruta.");
      } finally {
        setLoading(false);
      }
    };

    cargarRuta();
  }, [rutaId]);
  const asientosOcupados = ruta?.boletos.map((b) => b.asiento) ?? [];

  const getEstadoAsiento = (numero: string) => {
    if (numero === asientoSeleccionado) return "seleccionado";
    if (asientosOcupados.includes(numero)) return "ocupado";
    return "disponible";
  };

  const handleClickAsiento = (numero: string) => {
    if (asientosOcupados.includes(numero)) return;
    setAsientoSeleccionado((prev) => (prev === numero ? "" : numero));
  };

  const handleContinuar = () => {
    if (!asientoSeleccionado) {
      setError("Por favor selecciona un asiento.");
      return;
    }
    router.push(
      `/cliente/pagar?rutaId=${rutaId}&asiento=${asientoSeleccionado}`
    );
  };

  const generarAsientos = (capacidad: number) => {
    return Array.from({ length: capacidad }, (_, i) =>
      String(i + 1).padStart(2, "0")
    );
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Cargando asientos...</p>
      </div>
    );
  }

  if (error || !ruta) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error || "Error inesperado."}</p>
      </div>
    );
  }

  const asientos = generarAsientos(ruta.bus.capacidad);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Seleccionar Asiento
        </h1>

        {/* Info de la ruta */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <p className="font-semibold text-gray-800">
            {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            🕐 {ruta.frecuencia.hora} &nbsp;|&nbsp;
            🚌 Bus #{ruta.bus.numero} &nbsp;|&nbsp;
            📅 {new Date(ruta.fecha).toLocaleDateString("es-EC")}
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex gap-4 mb-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-green-400 inline-block" /> Disponible
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-red-400 inline-block" /> Ocupado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-blue-500 inline-block" /> Seleccionado
          </span>
        </div>

        {/* Mapa de asientos */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="text-center text-xs text-gray-400 mb-4 border-b pb-2">
            — FRENTE DEL BUS —
          </div>

          <div className="grid grid-cols-4 gap-2">
            {asientos.map((numero) => {
              const estado = getEstadoAsiento(numero);
              const esVIP = parseInt(numero) <= ruta.bus.asientosVIP;

              return (
                <button
                  key={numero}
                  onClick={() => handleClickAsiento(numero)}
                  disabled={estado === "ocupado"}
                  className={`
                    p-2 rounded text-sm font-medium border transition-colors
                    ${estado === "disponible" ? "bg-green-100 border-green-400 text-green-800 hover:bg-green-200" : ""}
                    ${estado === "ocupado" ? "bg-red-100 border-red-400 text-red-800 cursor-not-allowed opacity-60" : ""}
                    ${estado === "seleccionado" ? "bg-blue-500 border-blue-600 text-white" : ""}
                  `}
                >
                  {numero}
                  {esVIP && <span className="block text-xs opacity-70">VIP</span>}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <p className="text-gray-700">
            Asiento seleccionado:{" "}
            <span className="font-bold text-blue-600">
              {asientoSeleccionado || "Ninguno"}
            </span>
          </p>
          <button
            onClick={handleContinuar}
            disabled={!asientoSeleccionado}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continuar →
          </button>
        </div>

      </div>
    </div>
  );
}