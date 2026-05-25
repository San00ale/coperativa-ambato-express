"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Boleto {
  asiento: string;
  estado: string;
}

interface Bus {
  capacidad: number;
  asientosVIP: number;
}

interface Ruta {
  id: string;
  precio: number;
  bus: Bus;
  boletos: Boleto[];
}

// Componente que contiene la lógica y usa useSearchParams
function SeleccionarAsientoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rutaId = searchParams.get("rutaId");

  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!rutaId) {
      setError("No se ha seleccionado una ruta válida.");
      setLoading(false);
      return;
    }
    const cargarRuta = async () => {
      try {
        const res = await fetch(`/api/rutas/${rutaId}`);
        if (!res.ok) throw new Error("Error al cargar la ruta");
        const data: Ruta = await res.json();
        setRuta(data);
      } catch {
        setError("No se pudo cargar la información de asientos.");
      } finally {
        setLoading(false);
      }
    };
    cargarRuta();
  }, [rutaId]);

  const getEstadoAsiento = (num: number): "DISPONIBLE" | "PENDIENTE" | "OCUPADO" => {
    if (!ruta) return "DISPONIBLE";
    const boleto = ruta.boletos?.find((b) => Number(b.asiento) === num);
    if (!boleto) return "DISPONIBLE";
    if (boleto.estado === "PENDIENTE_APROBACION") return "PENDIENTE";
    if (boleto.estado === "APROBADO" || boleto.estado === "ABORDADO") return "OCUPADO";
    return "DISPONIBLE";
  };

  const esVIP = (num: number): boolean => {
    if (!ruta) return false;
    const capacidad = ruta.bus.capacidad;
    const vipCount = ruta.bus.asientosVIP;
    return num > capacidad - vipCount;
  };

  const handleSeleccionarAsiento = (num: number) => {
    if (getEstadoAsiento(num) !== "DISPONIBLE") return;
    const precioBase = ruta!.precio;
    const vip = esVIP(num);
    const precioFinal = vip ? precioBase * 1.2 : precioBase;
    router.push(`/cliente/pagar?rutaId=${rutaId}&asiento=${num}&precio=${precioFinal}`);
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
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!ruta) return null;

  const totalAsientos = ruta.bus.capacidad;
  const asientosVIP = ruta.bus.asientosVIP;
  const asientosNormales = totalAsientos - asientosVIP;

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
              const vip = esVIP(num);
              let bgClass = "bg-green-100 hover:bg-green-200 text-green-800";
              if (estado === "PENDIENTE") bgClass = "bg-yellow-100 text-yellow-800 cursor-not-allowed opacity-70";
              if (estado === "OCUPADO") bgClass = "bg-red-200 text-red-800 cursor-not-allowed opacity-70";
              if (vip && estado === "DISPONIBLE") bgClass = "bg-green-100 hover:bg-green-200 text-green-800 border-2 border-yellow-500";
              return (
                <button
                  key={num}
                  onClick={() => handleSeleccionarAsiento(num)}
                  disabled={estado !== "DISPONIBLE"}
                  className={`font-semibold py-2 rounded transition ${bgClass}`}
                >
                  {num} {vip && "⭐"}
                </button>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 mt-6 text-sm text-gray-700">            <span className="flex items-center gap-1">
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
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 border-2 border-yellow-500 bg-green-100 rounded inline-block"></span>
              VIP (+20%)
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