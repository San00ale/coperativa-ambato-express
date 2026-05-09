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