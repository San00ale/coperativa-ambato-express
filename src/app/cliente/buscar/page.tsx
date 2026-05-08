"use client";

import { useState } from "react";
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
