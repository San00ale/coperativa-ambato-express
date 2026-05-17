"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Boleto {
  asiento: string;
  estado: string;
}

// Componente que contiene la lógica y usa useSearchParams
function SeleccionarAsientoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rutaId = searchParams.get("rutaId");

  const [totalAsientos, setTotalAsientos] = useState(0);
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!rutaId) {
      setError("No se ha seleccionado una ruta válida.");
      setLoading(false);
      return;
    }
    const cargarAsientos = async () => {
      try {
        const res = await fetch(`/api/rutas/${rutaId}`);
        if (!res.ok) throw new Error("Error al cargar los asientos");
        const data = await res.json();
        setTotalAsientos(data.bus.capacidad || 40);
        setBoletos(data.boletos || []);
      } catch {
        setError("No se pudo cargar la disponibilidad de asientos.");
      } finally {
        setLoading(false);
      }
    };
    cargarAsientos();
  }, [rutaId]);

  const getEstadoAsiento = (num: number) => {
    const boleto = boletos.find((b) => Number(b.asiento) === num);
    if (!boleto) return "DISPONIBLE";
    if (boleto.estado === "APROBADO") return "APROBADO";
    if (boleto.estado === "PENDIENTE_APROBACION") return "PENDIENTE";
    return "DISPONIBLE";
  };

  const handleSeleccionarAsiento = (num: number) => {
    if (getEstadoAsiento(num) !== "DISPONIBLE") return;
    router.push(`/cliente/pagar?rutaId=${rutaId}&asiento=${num}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Cargando asientos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Selecciona tu asiento
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="w-full h-12 bg-gray-300 rounded mb-6 flex items-center justify-center text-gray-600">
            🔴 Parte delantera del bus 🔴
          </div>
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {Array.from({ length: totalAsientos }, (_, i) => i + 1).map((num) => {
              const estado = getEstadoAsiento(num);
              const estilos = {
                DISPONIBLE: "bg-green-100 hover:bg-green-200 text-green-800 cursor-pointer",
                PENDIENTE:  "bg-yellow-100 text-yellow-800 cursor-not-allowed opacity-70",
                APROBADO:   "bg-red-200 text-red-800 cursor-not-allowed opacity-70",
              }[estado];
              return (
                <button
                  key={num}
                  onClick={() => handleSeleccionarAsiento(num)}
                  disabled={estado !== "DISPONIBLE"}
                  className={`font-semibold py-2 rounded transition ${estilos}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 mt-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-green-100 rounded inline-block"></span>
              Disponible
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-yellow-100 rounded inline-block"></span>
              Pendiente
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-red-200 rounded inline-block"></span>
              Ocupado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal envuelto en Suspense (requerido por Next.js para useSearchParams)
export default function SeleccionarAsientoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <SeleccionarAsientoContent />
    </Suspense>
  );
}