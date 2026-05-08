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