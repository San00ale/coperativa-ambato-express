'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { QrCode, CheckCircle2, AlertCircle, Loader, Camera, X, RotateCcw } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface PasajeroInfo {
  nombre: string
  cedula: string
  asiento: string
  tipo: string
  metodoPago: string
}
