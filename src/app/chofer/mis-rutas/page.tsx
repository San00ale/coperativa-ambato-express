'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Clock, MapPin, Bus, CheckCircle2, Circle, AlertCircle, Loader } from 'lucide-react'

interface Ruta {
  id: string
  fecha: string
  completada: boolean
  frecuencia: {
    origen: string
    destino: string
    hora: string
    tipoViaje: string
    paradas: Array<{
      id: string
      ciudad: string
      orden: number
    }>
  }
  bus: {
    id: string
    numero: string
    placa: string
    marca: string
    carroceria: string
    chasis: string
    capacidad: number
    asientosVIP: number
  }
  boletos: Array<{
    id: string
  }>
}