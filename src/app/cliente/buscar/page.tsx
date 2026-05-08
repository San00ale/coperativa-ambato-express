"use client";

import { useState } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


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

  // Estados del formulario
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState("");

  // Estados de UI
  const [resultados, setResultados] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buscado, setBuscado] = useState(false);
  const [ciudadesOrigen, setCiudadesOrigen] = useState<string[]>([]);
  const [ciudadesDestino, setCiudadesDestino] = useState<string[]>([]);

  // Cargar ciudades únicas desde /api/frecuencias al montar el componente
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
        // Si falla, los selects quedan vacíos
        console.error("No se pudieron cargar las ciudades");
      }
    };
    cargarCiudades();
  }, []);
    const handleBuscar = async () => {
    if (!origen || !destino || !fecha) {
      setError("Por favor completa todos los campos.");
      return;
    }
    if (origen === destino) {
      setError("El origen y destino no pueden ser iguales.");
      return;
    }

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

  // Calcular asientos disponibles: capacidad del bus - boletos APROBADOS
  const getAsientosDisponibles = (ruta: Ruta) => {
    return ruta.bus.capacidad - ruta.boletos.length;
  };

  // Ir a selección de asiento pasando el id de la ruta
  const handleSeleccionar = (rutaId: string) => {
    router.push(`/cliente/seleccionar-asiento?rutaId=${rutaId}`);
  };