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