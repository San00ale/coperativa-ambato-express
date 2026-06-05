'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export interface ToastProps {
  message: string
  type: 'success' | 'error'
  duration?: number
  onClose?: () => void
}

export default function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50'
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200'
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800'
  const iconBg = type === 'success' ? 'bg-green-100' : 'bg-red-100'
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600'
  const Icon = type === 'success' ? CheckCircle : XCircle

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
      <div className={`${bgColor} ${borderColor} border rounded-xl shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md`}>
        <div className={`${iconBg} ${iconColor} p-2 rounded-full flex-shrink-0`}>
          <Icon size={20} />
        </div>
        <p className={`${textColor} font-medium flex-1`}>{message}</p>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className={`${textColor} hover:opacity-70 transition flex-shrink-0`}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
