interface Props {
  capacidad: number
  asientosVIP: number
  asientosOcupados: string[]
  asientoSeleccionado: string | null
  onAsientoClick: (asiento: string) => void
  precioBase: number
  onPrecioChange?: (precio: number) => void
}

export default function AsientosGrid({
  capacidad,
  asientosVIP,
  asientosOcupados,
  asientoSeleccionado,
  onAsientoClick,
  precioBase,
  onPrecioChange
}: Props) {
  const columnas = 4
  const asientosNormales = capacidad - asientosVIP

  const esVIP = (numeroAsiento: number): boolean => {
    // Los últimos asientos son VIP (ej: 36-40 de 40)
    return numeroAsiento > asientosNormales
  }

  const calcularPrecio = (numeroAsiento: number, tipoPasajero: string): number => {
    let precio = precioBase
    
    // Agregar recargo VIP (20%)
    if (esVIP(numeroAsiento)) {
      precio *= 1.2
    }
    
    // Aplicar descuento según tipo pasajero (50%)
    if (['MENOR', 'TERCERA_EDAD', 'DISCAPACITADO'].includes(tipoPasajero)) {
      precio *= 0.5
    }
    
    return Math.round(precio * 100) / 100
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-white">FRENTE DEL BUS</h3>
      
      <div className="grid gap-2 p-4 bg-gray-800 rounded-lg" 
        style={{
          gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
          gap: '0.5rem'
        }}>
        {Array.from({ length: capacidad }).map((_, i) => {
          const numeroAsiento = i + 1
          const esOcupado = asientosOcupados.includes(numeroAsiento.toString())
          const esSeleccionado = asientoSeleccionado === numeroAsiento.toString()
          const esVIPAsiento = esVIP(numeroAsiento)
          
          // Agregar separador (pasillo) entre columnas 2 y 3
          if (numeroAsiento % columnas === 3 && numeroAsiento % (columnas * 2) !== 3) {
            return <div key={`pasillo-${i}`} className="col-span-1" />
          }

          return (
            <button
              key={numeroAsiento}
              onClick={() => !esOcupado && onAsientoClick(numeroAsiento.toString())}
              disabled={esOcupado}
              className={`
                p-3 rounded font-bold text-sm transition relative
                flex items-center justify-center
                ${esOcupado 
                  ? 'bg-red-600 text-white cursor-not-allowed opacity-50' 
                  : esSeleccionado 
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400' 
                  : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                }
              `}>
              {numeroAsiento}
              {esVIPAsiento && (
                <span className="absolute top-0 right-0 text-xs">⭐</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 flex-wrap text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <span>VIP</span>
        </div>
      </div>
    </div>
  )
}