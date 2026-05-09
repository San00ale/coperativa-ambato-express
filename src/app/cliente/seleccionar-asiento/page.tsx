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