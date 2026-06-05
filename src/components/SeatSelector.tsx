'use client'

import { useState } from 'react'

interface SeatSelectorProps {
  capacidad: number
  selectedVIPSeats: number[]
  onSeatToggle: (seatNumber: number) => void
}

export default function SeatSelector({ capacidad, selectedVIPSeats, onSeatToggle }: SeatSelectorProps) {
  const seats = Array.from({ length: capacidad }, (_, i) => i + 1)
  
  // Calculate grid layout (4 seats per row: 2 left + aisle + 2 right)
  const seatsPerRow = 4
  const rows = Math.ceil(seats.length / seatsPerRow)

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Selección de Asientos VIP
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Haz clic en los asientos para marcarlos como VIP
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
        {/* Bus front indicator */}
        <div className="mb-4 text-center">
          <div className="inline-block bg-gray-300 px-8 py-2 rounded-t-lg text-xs text-gray-600 font-medium">
            Frente del Bus
          </div>
        </div>
        
        {/* Seats grid with aisle */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left side seats (columns 1-2) */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            {seats.filter((_, i) => (i % 4) < 2).map((seatNumber) => {
              const isVIP = selectedVIPSeats.includes(seatNumber)
              return (
                <button
                  key={seatNumber}
                  type="button"
                  onClick={() => onSeatToggle(seatNumber)}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all duration-200
                    ${isVIP 
                      ? 'bg-yellow-400 border-yellow-500 text-yellow-900' 
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                    }
                    hover:shadow-md
                  `}
                >
                  <div className="text-sm font-bold">
                    {seatNumber}
                  </div>
                  {isVIP && (
                    <div className="absolute top-1 right-1">
                      <svg className="w-3 h-3 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          
          {/* Aisle indicator */}
          <div className="hidden md:flex items-center justify-center w-8">
            <div className="h-full w-1 bg-gray-300 rounded"></div>
          </div>
          
          {/* Right side seats (columns 3-4) */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            {seats.filter((_, i) => (i % 4) >= 2).map((seatNumber) => {
              const isVIP = selectedVIPSeats.includes(seatNumber)
              return (
                <button
                  key={seatNumber}
                  type="button"
                  onClick={() => onSeatToggle(seatNumber)}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all duration-200
                    ${isVIP 
                      ? 'bg-yellow-400 border-yellow-500 text-yellow-900' 
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                    }
                    hover:shadow-md
                  `}
                >
                  <div className="text-sm font-bold">
                    {seatNumber}
                  </div>
                  {isVIP && (
                    <div className="absolute top-1 right-1">
                      <svg className="w-3 h-3 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
            <span className="text-gray-600">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 border-2 border-yellow-500 rounded"></div>
            <span className="text-gray-600">VIP</span>
          </div>
        </div>
        
        {/* Summary */}
        <div className="mt-3 text-center text-sm text-gray-700">
          Total asientos VIP seleccionados: <span className="font-bold text-yellow-600">{selectedVIPSeats.length}</span>
        </div>
      </div>
    </div>
  )
}
