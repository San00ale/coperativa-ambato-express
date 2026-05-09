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