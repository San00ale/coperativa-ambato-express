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
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Mis Compras
        </h1>

        {boletos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p className="text-lg">No tienes compras aún.</p>
            <p className="text-sm mt-1">Busca una ruta y compra tu boleto.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {boletos.map((boleto) => {
              const badge = getEstadoBadge(boleto.estado);
              return (
                <div
                  key={boleto.id}
                  className="bg-white rounded-lg shadow p-5"
                >
                  {/* Encabezado del boleto */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">
                        {boleto.ruta.frecuencia.origen} → {boleto.ruta.frecuencia.destino}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        🕐 {boleto.ruta.frecuencia.hora} &nbsp;|&nbsp;
                        📅 {new Date(boleto.ruta.fecha).toLocaleDateString("es-EC")} &nbsp;|&nbsp;
                        🚌 Bus #{boleto.ruta.bus.numero}
                      </p>
                    </div>
                    {/* Badge de estado */}
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${badge.clase}`}>
                      {badge.texto}
                    </span>
                  </div>

                  {/* Detalles del boleto */}
                  <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 border-t pt-3">
                    <div>
                      <p className="text-xs text-gray-400">Asiento</p>
                      <p className="font-medium text-gray-800">{boleto.asiento}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Tipo pasajero</p>
                      <p className="font-medium text-gray-800">{getTipoPasajero(boleto.tipoPasajero)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Precio pagado</p>
                      <p className="font-medium text-green-600">${boleto.precio.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* QR si está aprobado */}
                  {boleto.estado === "APROBADO" && boleto.qrUrl && (
                    <div className="mt-4 border-t pt-4 flex flex-col items-center">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        🎫 Tu código QR
                      </p>
                      <img
                        src={boleto.qrUrl}
                        alt="Código QR del boleto"
                        className="w-40 h-40 object-contain border rounded-md"
                      />
                    </div>
                  )}

                  {/* Mensaje si está pendiente */}
                  {boleto.estado === "PENDIENTE_APROBACION" && (
                    <div className="mt-4 border-t pt-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-700">
                        ⏳ Tu boleto está en revisión. El oficinista aprobará tu comprobante pronto.
                      </div>
                    </div>
                  )}

                  {/* Mensaje si está cancelado */}
                  {boleto.estado === "CANCELADO" && (
                    <div className="mt-4 border-t pt-4">
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                        ❌ Este boleto fue cancelado.
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}