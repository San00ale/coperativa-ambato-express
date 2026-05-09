'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { QrCode, CheckCircle2, AlertCircle, Loader, X, MapPin, Clock } from 'lucide-react'

interface Boleto {
  id: string
  estado: string
  asiento: string
  pasajero: {
    nombre: string
  }
}

interface RutaConBoletos {
  id: string
  completada: boolean
  frecuencia: {
    origen: string
    destino: string
    hora: string
  }
  bus: {
    numero: string
    placa: string
  }
  boletos: Boleto[]
}
