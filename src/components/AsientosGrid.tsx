interface AsientosGridProps {
  capacidad: number
  asientosVIP: number
  asientosOcupados: string[]
  asientoSeleccionado: string | null
  onAsientoClick: (asiento: string) => void
}

export default function AsientosGrid({
  capacidad,
  asientosVIP,
  asientosOcupados,
  asientoSeleccionado,
  onAsientoClick,
}: AsientosGridProps) {
  // Generar lista de asientos
  const generarAsientos = () => {
    const asientos = []
    const filas = Math.ceil(capacidad / 4) // 4 columnas
    let contador = 1

    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < 4; j++) {
        if (contador <= capacidad) {
          // Generar letra (A, B, C, D, E, F, G...) y número
          const fila = String.fromCharCode(65 + i)
          const numero = j + 1
          const asiento = `${fila}${numero}`
          
          // Determinar si es VIP (primeros asientosVIP)
          const isVIP = contador <= asientosVIP
          
          asientos.push({
            id: asiento,
            numero: contador,
            isVIP,
            isOcupado: asientosOcupados.includes(asiento),
            isSelected: asientoSeleccionado === asiento,
          })
          contador++
        }
      }
    }
    return asientos
  }

  const asientos = generarAsientos()

  return (
    <div className="space-y-6">
      {/* Grid de asientos - mostrar en filas de 4 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {asientos.map((asiento) => (
            <button
              key={asiento.id}
              onClick={() => onAsientoClick(asiento.id)}
              disabled={asiento.isOcupado}
              className={`
                aspect-square rounded-lg font-bold text-sm transition-all flex items-center justify-center relative
                ${asiento.isSelected
                  ? 'border-2 border-blue-500 bg-blue-100 text-blue-900 scale-105'
                  : asiento.isOcupado
                  ? 'border-2 border-red-400 bg-red-50 text-red-600 cursor-not-allowed opacity-60'
                  : 'border-2 border-green-400 bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                }
                ${asiento.isVIP ? 'ring-2 ring-yellow-400' : ''}
              `}
              title={`${asiento.id}${asiento.isVIP ? ' (VIP)' : ''}${asiento.isOcupado ? ' - Ocupado' : ''}`}
            >
              <div>
                <div className="text-lg">{asiento.id}</div>
                {asiento.isVIP && <div className="text-xs">VIP</div>}
              </div>
            </button>
          ))}
        </div>

        {/* Representación gráfica del autobús */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <div className="text-center mb-4">
            <div className="inline-block bg-gray-800 text-white px-4 py-2 rounded font-bold">
              FRENTE DEL BUS
            </div>
          </div>

          {/* Recrear vista frontal del bus */}
          <div className="flex justify-center gap-4">
            {/* Columnas A y B */}
            <div className="space-y-2">
              {[1, 2, 3].map((num) => {
                const asiento = asientos.find(a => a.id === `A${num}`)
                if (!asiento) return null
                return (
                  <div
                    key={asiento.id}
                    className={`
                      w-12 h-12 rounded flex items-center justify-center font-bold text-sm
                      ${asiento.isSelected
                        ? 'bg-blue-500 text-white'
                        : asiento.isOcupado
                        ? 'bg-red-400 text-white opacity-50'
                        : 'bg-green-400 text-white'
                      }
                    `}
                  >
                    {asiento.id}
                  </div>
                )
              })}
            </div>

            {/* Pasillo central */}
            <div className="w-8"></div>

            {/* Columnas C y D */}
            <div className="space-y-2">
              {[1, 2, 3].map((num) => {
                const asiento = asientos.find(a => a.id === `A${num + 2}`)
                if (!asiento) return null
                return (
                  <div
                    key={asiento.id}
                    className={`
                      w-12 h-12 rounded flex items-center justify-center font-bold text-sm
                      ${asiento.isSelected
                        ? 'bg-blue-500 text-white'
                        : asiento.isOcupado
                        ? 'bg-red-400 text-white opacity-50'
                        : 'bg-green-400 text-white'
                      }
                    `}
                  >
                    {asiento.id}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="font-semibold text-blue-900">Capacidad Total</div>
          <div className="text-2xl font-bold text-blue-600">{capacidad}</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="font-semibold text-yellow-900">Asientos VIP</div>
          <div className="text-2xl font-bold text-yellow-600">{asientosVIP}</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="font-semibold text-red-900">Ocupados</div>
          <div className="text-2xl font-bold text-red-600">{asientosOcupados.length}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="font-semibold text-green-900">Disponibles</div>
          <div className="text-2xl font-bold text-green-600">{capacidad - asientosOcupados.length}</div>
        </div>
      </div>
    </div>
  )
}