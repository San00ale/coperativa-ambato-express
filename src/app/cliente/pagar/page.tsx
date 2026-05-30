"use client";

import { Suspense } from "react";
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

// Componente interno que usa useSearchParams (debe estar envuelto en Suspense)
function PagarContent() {
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

    const tiposPermitidos = ["image/jpeg", "image/png"];
    if (!tiposPermitidos.includes(file.type)) {
      setError("Solo se permiten archivos de imagen (.jpg, .jpeg, .png).");
      setArchivo(null);
      setArchivoPreview("");
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSize) {
      setError("El archivo no debe superar los 2 MB.");
      setArchivo(null);
      setArchivoPreview("");
      return;
    }

    setError("");
    setArchivo(file);
    setArchivoPreview(URL.createObjectURL(file));
  };

  const handleConfirmar = async () => {
    if (!nombre.trim() || !cedula.trim()) {
      setError("Por favor completa nombre y cédula.");
      return;
    }
    if (cedula.length < 10) {
      setError("La cédula debe tener al menos 10 dígitos.");
      return;
    }
    if (!archivo) {
      setError("Por favor sube el comprobante de transferencia.");
      return;
    }

    setError("");
    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append("file", archivo);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Error al subir el comprobante");
      const { url: comprobanteUrl } = await uploadRes.json();

      const boletoRes = await fetch("/api/boletos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rutaId,
          asiento,
          precio: PRECIO_BASE,
          tipoPasajero,
          metodoPago: "TRANSFERENCIA",
          comprobanteUrl,
          pasajeroNombre: nombre,
          pasajeroCedula: cedula,
        }),
      });

      if (!boletoRes.ok) {
        const data = await boletoRes.json();
        throw new Error(data.error || "Error al crear el boleto");
      }

      router.push("/cliente/mis-compras");

    } catch (err: any) {
      setError(err.message || "Error inesperado. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Confirmar Compra
        </h1>

        {ruta && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <p className="font-semibold text-gray-800">
              {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              🕐 {ruta.frecuencia.hora} &nbsp;|&nbsp;
              💺 Asiento {asiento} &nbsp;|&nbsp;
              📅 {new Date(ruta.fecha).toLocaleDateString("es-EC")}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"  
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Cédula
            </label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Ej: 1804123456"
              maxLength={10}
              className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"  
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Tipo de pasajero
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_PASAJERO.map((tipo) => (
                <button
                  key={tipo.value}
                  onClick={() => setTipoPasajero(tipo.value)}
                  className={`p-3 rounded-md border text-left text-sm transition-colors ${
                    tipoPasajero === tipo.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <p className="font-medium">{tipo.label}</p>
                  <p className="text-xs text-gray-500">{tipo.descuento}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-md p-3 flex justify-between items-center">
            <span className="text-sm text-gray-600">Precio a pagar:</span>
            <span className="text-lg font-bold text-green-600">
              ${precioFinal.toFixed(2)}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Comprobante de transferencia
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleArchivoChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {archivo && (
              <p className="mt-2 text-xs text-gray-500">
                📎 {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {archivoPreview && (
              <img
                src={archivoPreview}
                alt="Preview comprobante"
                className="mt-3 w-full max-h-48 object-contain rounded-md border"
              />
            )}
          </div>

            {error && <p className="text-red-700 text-sm">{error}</p>}

          <button
            onClick={handleConfirmar}
            disabled={enviando}
            className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {enviando ? "Procesando..." : "✅ Confirmar Compra"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente principal envuelto en Suspense (requerido por Next.js para useSearchParams)
export default function PagarPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <PagarContent />
    </Suspense>
  );
}
