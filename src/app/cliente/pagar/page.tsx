"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { validarCedulaEcuatoriana } from "@/lib/validations";

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
  precio: number;
  frecuencia: Frecuencia;
}

function PagarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rutaId = searchParams.get("rutaId");
  const asiento = searchParams.get("asiento");
  const precioParam = searchParams.get("precio");

  const precioBase = precioParam ? parseFloat(precioParam) : 0;

  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [errorCedula, setErrorCedula] = useState("");
  const [tipoPasajero, setTipoPasajero] = useState("ADULTO");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoPreview, setArchivoPreview] = useState<string>("");
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const precioFinal = precioBase * (1 - DESCUENTOS[tipoPasajero]);

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

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setNombre(valor);
    if (valor.trim().length === 0) {
      setErrorNombre("El nombre completo es obligatorio.");
    } else if (valor.trim().length < 3) {
      setErrorNombre("El nombre debe tener al menos 3 caracteres.");
    } else {
      setErrorNombre("");
    }
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, "").slice(0, 10);
    setCedula(valor);
    if (valor.length === 0) {
      setErrorCedula("La cédula es obligatoria.");
    } else if (valor.length < 10) {
      setErrorCedula(`Cédula incompleta (${valor.length}/10 dígitos).`);
    } else if (!validarCedulaEcuatoriana(valor)) {
      setErrorCedula("Cédula inválida. Verifica el número ingresado.");
    } else {
      setErrorCedula("");
    }
  };

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

    const maxSize = 2 * 1024 * 1024;
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

  const confirmarHabilitado =
    !!asiento &&
    nombre.trim().length >= 3 &&
    !errorNombre &&
    cedula.length === 10 &&
    !errorCedula &&
    validarCedulaEcuatoriana(cedula) &&
    !!tipoPasajero &&
    !!archivo &&
    !enviando;

  const handleConfirmar = async () => {
    if (!confirmarHabilitado) return;

    setError("");
    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append("file", archivo!);

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
          precio: precioFinal,
          tipoPasajero,
          metodoPago: "TRANSFERENCIA",
          comprobanteUrl,
          pasajeroNombre: nombre.trim(),
          pasajeroCedula: cedula,
        }),
      });

      if (!boletoRes.ok) {
        const data = await boletoRes.json();
        throw new Error(data.error || "Error al crear el boleto");
      }

      router.push("/cliente/mis-compras");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado. Intenta de nuevo.";
      setError(message);
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
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800">
                {ruta.frecuencia.origen} → {ruta.frecuencia.destino}
              </p>
              {precioBase > ruta.precio && (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                  ⭐ Asiento VIP
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              🕐 {ruta.frecuencia.hora} &nbsp;|&nbsp;
              💺 Asiento {asiento} &nbsp;|&nbsp;
              📅 {new Date(ruta.fecha).toLocaleDateString("es-EC")}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-5">

          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={handleNombreChange}
              placeholder="Ej: Juan Pérez"
              className={`w-full border rounded-md p-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errorNombre ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errorNombre && (
              <p className="text-red-600 text-xs mt-1">{errorNombre}</p>
            )}
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Cédula
            </label>
            <input
              type="text"
              value={cedula}
              onChange={handleCedulaChange}
              placeholder="Ej: 1804123456"
              maxLength={10}
              inputMode="numeric"
              className={`w-full border rounded-md p-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errorCedula
                  ? "border-red-500"
                  : cedula.length === 10 && !errorCedula
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            />
            {errorCedula ? (
              <p className="text-red-600 text-xs mt-1">{errorCedula}</p>
            ) : cedula.length === 10 && !errorCedula ? (
              <p className="text-green-600 text-xs mt-1">✅ Cédula válida</p>
            ) : null}
          </div>

          {/* Tipo de pasajero */}
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
                      : "border-gray-300 hover:border-gray-400 text-gray-900"
                  }`}
                >
                  <p className="font-medium">{tipo.label}</p>
                  <p className="text-xs text-gray-500">{tipo.descuento}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Precio */}
          <div className="bg-gray-50 rounded-md p-3 space-y-1">
            {precioBase !== precioFinal && (
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Precio base:</span>
                <span>${precioBase.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Precio a pagar:</span>
              <span className="text-lg font-bold text-green-600">
                ${precioFinal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Comprobante */}
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
            {!archivo && (
              <p className="text-gray-400 text-xs mt-1">
                Sube la imagen del comprobante para continuar.
              </p>
            )}
          </div>

          {error && <p className="text-red-700 text-sm">{error}</p>}

          {/* Botón dinámico */}
          <button
            onClick={handleConfirmar}
            disabled={!confirmarHabilitado}
            className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {enviando ? "Procesando..." : "✅ Confirmar Compra"}
          </button>

          {!confirmarHabilitado && !enviando && (
            <p className="text-center text-xs text-gray-400">
              Completa todos los campos correctamente para continuar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PagarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Cargando...
        </div>
      }
    >
      <PagarContent />
    </Suspense>
  );
}