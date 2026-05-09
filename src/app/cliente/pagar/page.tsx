"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PRECIO_BASE = 5.00;

const DESCUENTOS: Record<string, number> = {
  ADULTO: 0,
  NINO: 0.5,
  TERCERA_EDAD: 0.5,
  DISCAPACITADO: 0.5,
};

const TIPOS_PASAJERO = [
  { value: "ADULTO",        label: "Adulto",        descuento: "Sin descuento" },
  { value: "NINO",          label: "Niño",          descuento: "50% descuento" },
  { value: "TERCERA_EDAD",  label: "Tercera Edad",  descuento: "50% descuento" },
  { value: "DISCAPACITADO", label: "Discapacitado", descuento: "50% descuento" },
];

interface Frecuencia {
  origen: string;
  destino: string;
  hora: string;
}

interface Ruta {
  id: string;
  fecha: string;
  frecuencia: Frecuencia;
}
export default function PagarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rutaId = searchParams.get("rutaId");
  const asiento = searchParams.get("asiento");

  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [tipoPasajero, setTipoPasajero] = useState("ADULTO");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoPreview, setArchivoPreview] = useState<string>("");
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const precioFinal = PRECIO_BASE * (1 - DESCUENTOS[tipoPasajero]);

  useEffect(() => {
    if (!rutaId) return;

    const cargarRuta = async () => {
      try {
        const res = await fetch(`/api/rutas?rutaId=${rutaId}`);
        const data: Ruta[] = await res.json();
        const rutaEncontrada = data.find((r) => r.id === rutaId);
        if (rutaEncontrada) setRuta(rutaEncontrada);
      } catch {
        setError("No se pudo cargar la información de la ruta.");
      } finally {
        setLoading(false);
      }
    };

    cargarRuta();
  }, [rutaId]);

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivo(file);
    setArchivoPreview(URL.createObjectURL(file));
  };

