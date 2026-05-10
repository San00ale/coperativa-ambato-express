"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Componente que contiene la lógica y usa useSearchParams
function SeleccionarAsientoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rutaId = searchParams.get("rutaId");

  const [asientos, setAsientos] = useState<number[]>([]);
  const [asientoSeleccionado, setAsientoSeleccionado] = useState<number | null>(null);
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

        // Suponiendo que la ruta tiene una capacidad máxima de asientos
        const totalAsientos = data.bus.capacidad || 40;
        const asientosOcupados = data.boletos?.map((b: any) => Number(b.asiento)) || [];
        const disponibles = Array.from({ length: totalAsientos }, (_, i) => i + 1)
          .filter((asiento) => !asientosOcupados.includes(asiento));
        setAsientos(disponibles);
      } catch (err) {
        setError("No se pudo cargar la disponibilidad de asientos.");
      } finally {
        setLoading(false);
      }
    };

    cargarAsientos();
  }, [rutaId]);

  const handleSeleccionarAsiento = (asiento: number) => {
    setAsientoSeleccionado(asiento);
    router.push(`/cliente/pagar?rutaId=${rutaId}&asiento=${asiento}`);
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Selecciona tu asiento</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="w-full h-12 bg-gray-300 rounded mb-6 flex items-center justify-center text-gray-600">
            🔴 Parte delantera del bus 🔴
          </div>
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {asientos.map((num) => (
              <button
                key={num}
                onClick={() => handleSeleccionarAsiento(num)}
                className="bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-2 rounded transition"
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-green-100 rounded inline-block"></span> Disponible
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-red-200 rounded inline-block"></span> Ocupado
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
