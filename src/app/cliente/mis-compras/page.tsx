"use client";

import { useState, useEffect } from "react";

interface Frecuencia {
  origen: string;
  destino: string;
  hora: string;
}

interface Bus {
  numero: string;
}

interface Ruta {
  fecha: string;
  frecuencia: Frecuencia;
  bus: Bus;
}

interface Boleto {
  id: string;
  asiento: string;
  precio: number;
  tipoPasajero: string;
  estado: string;
  qrUrl: string | null;
  createdAt: string;
  ruta: Ruta;
}
export default function MisComprasPage() {
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarCompras = async () => {
      try {
        const res = await fetch("/api/boletos/mis-compras");
        if (!res.ok) throw new Error("Error al obtener compras");
        const data: Boleto[] = await res.json();
        setBoletos(data);
      } catch {
        setError("No se pudo cargar el historial de compras.");
      } finally {
        setLoading(false);
      }
    };

    cargarCompras();
  }, []);
 // Color y texto según estado del boleto
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return { texto: "Aprobado", clase: "bg-green-100 text-green-700 border-green-300" };
      case "PENDIENTE_APROBACION":
        return { texto: "Pendiente aprobación", clase: "bg-yellow-100 text-yellow-700 border-yellow-300" };
      case "CANCELADO":
        return { texto: "Cancelado", clase: "bg-red-100 text-red-700 border-red-300" };
      default:
        return { texto: estado, clase: "bg-gray-100 text-gray-700 border-gray-300" };
    }
  };

  // Etiqueta del tipo de pasajero
  const getTipoPasajero = (tipo: string) => {
    const tipos: Record<string, string> = {
      ADULTO: "Adulto",
      NINO: "Niño",
      TERCERA_EDAD: "Tercera Edad",
      DISCAPACITADO: "Discapacitado",
    };
    return tipos[tipo] || tipo;
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Cargando historial...</p>
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